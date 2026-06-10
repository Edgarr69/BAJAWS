-- ============================================================
-- 008 — Definiciones de RPCs (exportadas de la base remota)
-- Cierra el pendiente documentado en 001_schema_completo.sql:
-- los cuerpos viven en producción; este archivo los versiona.
-- CREATE OR REPLACE: idempotente, seguro de re-aplicar.
-- ============================================================

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
  BEGIN
    v_role := get_my_role();

    IF v_role IS NULL OR v_role NOT IN ('superadmin', 'admin', 'atencion') THEN
      RETURN jsonb_build_object('error', 'FORBIDDEN');
    END IF;

    IF p_group_by NOT IN ('topic', 'question', 'day', 'week') THEN
      RETURN jsonb_build_object('error', 'INVALID_GROUP_BY',
        'message', 'group_by debe ser: topic, question, day, week');
    END IF;

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

CREATE OR REPLACE FUNCTION public.export_raw_answers(p_date_from date DEFAULT NULL::date, p_date_to date DEFAULT NULL::date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_result JSONB;
BEGIN
  IF get_my_role() NOT IN ('admin', 'superadmin') THEN
    RETURN jsonb_build_object('error', 'FORBIDDEN', 'message', 'Solo administradores');
  END IF;

  SELECT jsonb_agg(to_jsonb(r)) INTO v_result FROM (
    SELECT
      fs.id                AS submission_id,
      fs.submitted_at,
      fl.code              AS link_code,
      s.folio              AS service_folio,
      s.service_date,
      t.name               AS topic,
      q.text               AS question_text,
      fa.value_int,
      fa.value_text        AS comment
    FROM public.feedback_answers    fa
    JOIN public.feedback_submissions fs ON fs.id  = fa.submission_id
    JOIN public.feedback_links       fl ON fl.id  = fs.link_id
    LEFT JOIN public.services        s  ON s.id   = fs.service_id
    JOIN public.questions            q  ON q.id   = fa.question_id
    JOIN public.topics               t  ON t.id   = q.topic_id
    WHERE (p_date_from IS NULL OR fs.submitted_at::DATE >= p_date_from)
      AND (p_date_to   IS NULL OR fs.submitted_at::DATE <= p_date_to)
    ORDER BY fs.submitted_at DESC, t.display_order, q.display_order
  ) r;

  RETURN jsonb_build_object(
    'ok',        true,
    'date_from', p_date_from,
    'date_to',   p_date_to,
    'data',      COALESCE(v_result, '[]'::jsonb)
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_public_form(p_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_link      public.feedback_links%ROWTYPE;
  v_questions JSONB;
BEGIN
  SELECT * INTO v_link
  FROM public.feedback_links
  WHERE code = upper(trim(p_code));

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'INVALID', 'message', 'Código inválido');
  END IF;

  IF v_link.blocked_at IS NOT NULL THEN
    RETURN jsonb_build_object('error', 'BLOCKED', 'message', 'Enlace bloqueado');
  END IF;

  IF v_link.used_at IS NOT NULL THEN
    RETURN jsonb_build_object('error', 'USED', 'message', 'Formulario ya completado');
  END IF;

  IF v_link.expires_at < now() THEN
    RETURN jsonb_build_object('error', 'EXPIRED', 'message', 'Enlace expirado');
  END IF;

  -- Solo preguntas activas de la versión del formulario
  -- NO retorna: service_id, created_by, ni ningún dato interno
  SELECT jsonb_agg(
    jsonb_build_object(
      'id',    q.id,
      'text',  q.text,
      'type',  q.type,
      'topic', t.name,
      'order', fvq.display_order
    )
    ORDER BY fvq.display_order
  )
  INTO v_questions
  FROM public.form_version_questions fvq
  JOIN public.questions q ON q.id = fvq.question_id
  JOIN public.topics    t ON t.id = q.topic_id
  WHERE fvq.form_version_id = v_link.form_version_id
    AND q.is_active = true;

  RETURN jsonb_build_object(
    'ok',              true,
    'form_version_id', v_link.form_version_id,
    'expires_at',      v_link.expires_at,
    'questions',       COALESCE(v_questions, '[]'::jsonb)
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.submit_feedback(p_code text, p_answers jsonb, p_ip_hash text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_link          public.feedback_links%ROWTYPE;
  v_submission_id UUID;
  v_answer        JSONB;
  v_question_id   INT;
  v_value_int     SMALLINT;
BEGIN
  -- Lock de fila: previene doble envío concurrente
  SELECT * INTO v_link
  FROM public.feedback_links
  WHERE code = upper(trim(p_code))
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'INVALID', 'message', 'Código inválido');
  END IF;

  IF v_link.blocked_at IS NOT NULL THEN
    RETURN jsonb_build_object('error', 'BLOCKED', 'message', 'Enlace bloqueado');
  END IF;

  IF v_link.used_at IS NOT NULL THEN
    RETURN jsonb_build_object('error', 'USED', 'message', 'Formulario ya enviado');
  END IF;

  IF v_link.expires_at < now() THEN
    RETURN jsonb_build_object('error', 'EXPIRED', 'message', 'Enlace expirado');
  END IF;

  IF v_link.attempts >= v_link.max_attempts THEN
    UPDATE public.feedback_links SET blocked_at = now() WHERE id = v_link.id;
    RETURN jsonb_build_object('error', 'BLOCKED', 'message', 'Máximo de intentos alcanzado');
  END IF;

  -- Validar payload antes de insertar nada
  IF p_answers IS NULL OR jsonb_typeof(p_answers) != 'array'
     OR jsonb_array_length(p_answers) = 0 THEN
    UPDATE public.feedback_links SET attempts = attempts + 1 WHERE id = v_link.id;
    RETURN jsonb_build_object('error', 'INVALID_PAYLOAD',
      'message', 'answers debe ser un array no vacío');
  END IF;

  FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers) LOOP
    v_question_id := (v_answer->>'question_id')::INT;
    v_value_int   := (v_answer->>'value')::SMALLINT;

    IF v_value_int IS NULL OR v_value_int < 1 OR v_value_int > 5 THEN
      UPDATE public.feedback_links SET attempts = attempts + 1 WHERE id = v_link.id;
      RETURN jsonb_build_object('error', 'INVALID_VALUE',
        'message', 'El valor debe ser entre 1 y 5',
        'question_id', v_question_id);
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.form_version_questions fvq
      JOIN public.questions q ON q.id = fvq.question_id
      WHERE fvq.form_version_id = v_link.form_version_id
        AND fvq.question_id     = v_question_id
        AND q.is_active         = true
    ) THEN
      UPDATE public.feedback_links SET attempts = attempts + 1 WHERE id = v_link.id;
      RETURN jsonb_build_object('error', 'INVALID_QUESTION',
        'message', 'Pregunta no válida para este formulario',
        'question_id', v_question_id);
    END IF;
  END LOOP;

  -- Todo válido → crear submission
  INSERT INTO public.feedback_submissions
    (link_id, service_id, form_version_id, ip_hash)
  VALUES
    (v_link.id, v_link.service_id, v_link.form_version_id, p_ip_hash)
  RETURNING id INTO v_submission_id;

  -- Insertar respuestas
  FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers) LOOP
    INSERT INTO public.feedback_answers
      (submission_id, question_id, value_int, value_text)
    VALUES (
      v_submission_id,
      (v_answer->>'question_id')::INT,
      (v_answer->>'value')::SMALLINT,
      v_answer->>'comment'
    );
  END LOOP;

  -- Marcar como usado (one-time use)
  UPDATE public.feedback_links
  SET used_at = now(), attempts = attempts + 1
  WHERE id = v_link.id;

  RETURN jsonb_build_object(
    'ok',            true,
    'submission_id', v_submission_id,
    'submitted_at',  now()
  );
END;
$function$;
