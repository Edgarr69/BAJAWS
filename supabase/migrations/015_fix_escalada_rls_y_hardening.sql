-- ============================================================
-- 015 — Cierre de escalada de privilegios vía RLS + hardening
--
-- Hallazgos de la auditoría de seguridad (2026-07-10):
--   1. CRÍTICA — profiles_update_admin sin WITH CHECK permitía a un
--      admin auto-ascenderse a superadmin (o degradar a otros) vía
--      PostgREST directo con la anon key, saltándose set-role.
--   2. MEDIA — 009 intentó dropear "contact_insert_public" pero la
--      política real se llama "contact_requests_insert_public"; el
--      DROP falló en silencio y el INSERT público sigue abierto.
--   3. MEDIA — funciones auxiliares SECURITY DEFINER sin search_path
--      fijo (riesgo de search_path hijacking).
--   4. BAJA — atencion veía métricas agregadas de toda la empresa.
--   5. BAJA — atencion podía asociar un enlace a un service_id ajeno.
--
-- TODOS los cambios son seguros de aplicar de inmediato: la app
-- escribe profiles/contact_requests con service role (bypasa RLS),
-- y las restricciones de atencion solo acotan su propio alcance.
-- ============================================================

-- ── 1. CRÍTICA: cerrar la escalada admin → superadmin ────────
-- La política permisiva de UPDATE para admins no tenía WITH CHECK,
-- así que Postgres reusaba USING como check y no restringía el nuevo
-- valor de `role`. Todos los cambios legítimos de rol pasan por la
-- API con service role (getAdminClient bypasa RLS), por lo que el
-- rol `authenticated` no necesita poder escribir `role` nunca.
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;

-- Defensa en profundidad a nivel de grants: authenticated solo puede
-- actualizar sus columnas no sensibles (la política profiles_update_own_nonrole
-- sigue limitando el UPDATE a la fila propia).
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT  UPDATE (full_name, updated_at) ON public.profiles TO authenticated;

-- ── 2. MEDIA: dropear la política de INSERT público real ─────
-- El nombre real difiere del que intentó dropear 009. Cubrimos ambos
-- por si en producción quedó con cualquiera de los dos nombres.
DROP POLICY IF EXISTS "contact_requests_insert_public" ON public.contact_requests;
DROP POLICY IF EXISTS "contact_insert_public"          ON public.contact_requests;

-- ── 3. MEDIA: fijar search_path en funciones SECURITY DEFINER ─
-- Robusto ante firmas ligeramente distintas en prod: si alguna función
-- no existe con esa firma, se omite sin abortar la migración.
DO $$
DECLARE
  fn   text;
  fns  text[] := ARRAY[
    'public.is_admin_or_above()',
    'public.get_my_role()',
    'public.generate_short_code(integer)',
    'public.handle_new_user()'
  ];
BEGIN
  FOREACH fn IN ARRAY fns LOOP
    BEGIN
      EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', fn);
    EXCEPTION WHEN undefined_function THEN
      RAISE NOTICE 'Funcion no encontrada, se omite: %', fn;
    END;
  END LOOP;
END $$;

-- ── 4 y 5. BAJA: acotar el alcance del rol atencion ──────────
-- Se re-crean dos RPC (cuerpos versionados en 008) añadiendo:
--   · create_feedback_link: atencion solo puede usar servicios propios.
--   · export_metrics_aggregate: atencion solo ve métricas de sus enlaces.
-- admin/superadmin conservan el comportamiento anterior sin cambios.

CREATE OR REPLACE FUNCTION public.create_feedback_link(p_service_id uuid DEFAULT NULL::uuid, p_ttl_seconds integer DEFAULT 3600)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_role        TEXT;
  v_code        TEXT;
  v_form_ver_id INT;
  v_expires_at  TIMESTAMPTZ;
  v_link_id     UUID;
  v_attempt     INT := 0;
BEGIN
  v_role := get_my_role();

  IF v_role IS NULL THEN
    RETURN jsonb_build_object('error', 'UNAUTHORIZED', 'message', 'No autenticado');
  END IF;

  IF v_role NOT IN ('superadmin', 'admin', 'atencion') THEN
    RETURN jsonb_build_object('error', 'FORBIDDEN', 'message', 'Rol insuficiente');
  END IF;

  IF v_role = 'atencion' AND p_ttl_seconds != 3600 THEN
    RETURN jsonb_build_object('error', 'FORBIDDEN',
      'message', 'atencion solo puede usar TTL de 3600 segundos');
  END IF;

  IF v_role IN ('admin', 'superadmin') AND (p_ttl_seconds < 900 OR p_ttl_seconds > 86400) THEN
    RETURN jsonb_build_object('error', 'INVALID_TTL',
      'message', 'TTL debe ser entre 900 y 86400 segundos');
  END IF;

  -- atencion solo puede asociar enlaces a servicios que le pertenecen.
  IF v_role = 'atencion' AND p_service_id IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM public.services
       WHERE id = p_service_id AND created_by = auth.uid()
     ) THEN
    RETURN jsonb_build_object('error', 'FORBIDDEN',
      'message', 'Servicio no válido');
  END IF;

  SELECT id INTO v_form_ver_id
  FROM public.form_versions WHERE is_current = true LIMIT 1;

  IF v_form_ver_id IS NULL THEN
    RETURN jsonb_build_object('error', 'NO_FORM_VERSION',
      'message', 'No existe version de formulario activa');
  END IF;

  v_expires_at := now() + (p_ttl_seconds || ' seconds')::INTERVAL;

  LOOP
    v_attempt := v_attempt + 1;
    IF v_attempt > 10 THEN
      RETURN jsonb_build_object('error', 'CODE_COLLISION',
        'message', 'No se pudo generar codigo unico tras 10 intentos');
    END IF;
    v_code := generate_short_code(8);
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.feedback_links WHERE code = v_code
    );
  END LOOP;

  INSERT INTO public.feedback_links
    (code, service_id, form_version_id, expires_at, ttl_seconds, created_by)
  VALUES
    (v_code, p_service_id, v_form_ver_id, v_expires_at, p_ttl_seconds, auth.uid())
  RETURNING id INTO v_link_id;

  INSERT INTO public.audit_log (actor_id, action, table_name, record_id, new_data)
  VALUES (auth.uid(), 'create_link', 'feedback_links', v_link_id::TEXT,
    jsonb_build_object('code', v_code, 'ttl_seconds', p_ttl_seconds,
                       'service_id', p_service_id));

  RETURN jsonb_build_object(
    'ok',          true,
    'link_id',     v_link_id,
    'code',        v_code,
    'url',         'https://bajaws.com.mx/formulario/' || v_code,
    'expires_at',  v_expires_at,
    'ttl_seconds', p_ttl_seconds
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.export_metrics_aggregate(p_date_from date DEFAULT NULL::date, p_date_to date DEFAULT NULL::date, p_group_by text DEFAULT 'topic'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$DECLARE
    v_role   TEXT;
    v_result JSONB;
    v_own    BOOLEAN;   -- true cuando el llamante solo puede ver lo suyo (atencion)
  BEGIN
    v_role := get_my_role();

    IF v_role IS NULL OR v_role NOT IN ('superadmin', 'admin', 'atencion') THEN
      RETURN jsonb_build_object('error', 'FORBIDDEN');
    END IF;

    IF p_group_by NOT IN ('topic', 'question', 'day', 'week') THEN
      RETURN jsonb_build_object('error', 'INVALID_GROUP_BY',
        'message', 'group_by debe ser: topic, question, day, week');
    END IF;

    v_own := (v_role = 'atencion');

    IF p_group_by = 'topic' THEN
      SELECT jsonb_agg(to_jsonb(r)) INTO v_result FROM (
        SELECT
          t.name                                                                        AS topic,
          ROUND(AVG(fa.value_int)::NUMERIC, 2)                                          AS avg_score,
          COUNT(DISTINCT fs.id)                                                         AS total_responses,
          ROUND(COUNT(fa.id) FILTER (WHERE fa.value_int >= 4)::NUMERIC
            / NULLIF(COUNT(fa.id), 0) * 100, 1)                                         AS pct_positive,
          ROUND(COUNT(fa.id) FILTER (WHERE fa.value_int <= 2)::NUMERIC
            / NULLIF(COUNT(fa.id), 0) * 100, 1)                                         AS pct_negative,
          COUNT(fa.id) FILTER (WHERE fa.value_int = 1)                                  AS dist_1,
          COUNT(fa.id) FILTER (WHERE fa.value_int = 2)                                  AS dist_2,
          COUNT(fa.id) FILTER (WHERE fa.value_int = 3)                                  AS dist_3,
          COUNT(fa.id) FILTER (WHERE fa.value_int = 4)                                  AS dist_4,
          COUNT(fa.id) FILTER (WHERE fa.value_int = 5)                                  AS dist_5
        FROM public.feedback_answers    fa
        JOIN public.feedback_submissions fs ON fs.id = fa.submission_id
        JOIN public.questions            q  ON q.id  = fa.question_id
        JOIN public.topics               t  ON t.id  = q.topic_id
        WHERE (p_date_from IS NULL OR fs.submitted_at::DATE >= p_date_from)
          AND (p_date_to   IS NULL OR fs.submitted_at::DATE <= p_date_to)
          AND (NOT v_own OR fs.link_id IN (
                SELECT id FROM public.feedback_links WHERE created_by = auth.uid()))
        GROUP BY t.id, t.name
        ORDER BY t.display_order
      ) r;

    ELSIF p_group_by = 'question' THEN
      SELECT jsonb_agg(to_jsonb(r)) INTO v_result FROM (
        SELECT
          t.name                                                                        AS topic,
          q.id                                                                          AS question_id,
          q.text                                                                        AS question_text,
          ROUND(AVG(fa.value_int)::NUMERIC, 2)                                          AS avg_score,
          COUNT(DISTINCT fs.id)                                                         AS total_responses,
          ROUND(COUNT(fa.id) FILTER (WHERE fa.value_int >= 4)::NUMERIC
            / NULLIF(COUNT(fa.id), 0) * 100, 1)                                         AS pct_positive,
          ROUND(COUNT(fa.id) FILTER (WHERE fa.value_int <= 2)::NUMERIC
            / NULLIF(COUNT(fa.id), 0) * 100, 1)                                         AS pct_negative
        FROM public.feedback_answers    fa
        JOIN public.feedback_submissions fs ON fs.id = fa.submission_id
        JOIN public.questions            q  ON q.id  = fa.question_id
        JOIN public.topics               t  ON t.id  = q.topic_id
        WHERE (p_date_from IS NULL OR fs.submitted_at::DATE >= p_date_from)
          AND (p_date_to   IS NULL OR fs.submitted_at::DATE <= p_date_to)
          AND (NOT v_own OR fs.link_id IN (
                SELECT id FROM public.feedback_links WHERE created_by = auth.uid()))
        GROUP BY t.id, t.name, q.id, q.text
        ORDER BY avg_score ASC NULLS LAST
      ) r;

    ELSIF p_group_by = 'day' THEN
      SELECT jsonb_agg(to_jsonb(r)) INTO v_result FROM (
        SELECT
          fs.submitted_at::DATE                AS date,
          COUNT(DISTINCT fs.id)                AS total_submissions,
          ROUND(AVG(fa.value_int)::NUMERIC, 2) AS avg_score_global
        FROM public.feedback_answers    fa
        JOIN public.feedback_submissions fs ON fs.id = fa.submission_id
        WHERE (p_date_from IS NULL OR fs.submitted_at::DATE >= p_date_from)
          AND (p_date_to   IS NULL OR fs.submitted_at::DATE <= p_date_to)
          AND (NOT v_own OR fs.link_id IN (
                SELECT id FROM public.feedback_links WHERE created_by = auth.uid()))
        GROUP BY fs.submitted_at::DATE
        ORDER BY date
      ) r;

    ELSIF p_group_by = 'week' THEN
      SELECT jsonb_agg(to_jsonb(r)) INTO v_result FROM (
        SELECT
          date_trunc('week', fs.submitted_at)::DATE AS week_start,
          COUNT(DISTINCT fs.id)                      AS total_submissions,
          ROUND(AVG(fa.value_int)::NUMERIC, 2)       AS avg_score_global
        FROM public.feedback_answers    fa
        JOIN public.feedback_submissions fs ON fs.id = fa.submission_id
        WHERE (p_date_from IS NULL OR fs.submitted_at::DATE >= p_date_from)
          AND (p_date_to   IS NULL OR fs.submitted_at::DATE <= p_date_to)
          AND (NOT v_own OR fs.link_id IN (
                SELECT id FROM public.feedback_links WHERE created_by = auth.uid()))
        GROUP BY date_trunc('week', fs.submitted_at)
        ORDER BY week_start
      ) r;
    END IF;

    RETURN jsonb_build_object(
      'ok',        true,
      'group_by',  p_group_by,
      'date_from', p_date_from,
      'date_to',   p_date_to,
      'data',      COALESCE(v_result, '[]'::jsonb)
    );
  END;$function$;
