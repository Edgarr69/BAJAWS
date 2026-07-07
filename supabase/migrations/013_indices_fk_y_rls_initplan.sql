-- ============================================================
-- Índice FK faltante + optimización initplan en políticas RLS
--
-- 1. job_applications.posting_id era la única FK consultada sin
--    índice. El compuesto (posting_id, correo) cubre:
--      - chequeo de postulación duplicada en /api/public/apply
--      - filtro por vacante en /panel/postulaciones
--      - borrado en cascada al eliminar una vacante
--
-- 2. Las 7 políticas señaladas por el advisor auth_rls_initplan
--    llamaban auth.uid() (y get_my_role()) sin envolver en
--    (select ...), lo que las re-evalúa por cada fila. Envueltas,
--    Postgres las resuelve una sola vez como InitPlan.
--    Se reescriben con ALTER POLICY: conserva nombre, comando y
--    roles; solo cambia la expresión.
-- ============================================================

-- ── 1. Índice FK ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_applications_posting_correo
  ON job_applications (posting_id, correo);

-- ── 2. Políticas RLS (advisor: auth_rls_initplan) ────────────

ALTER POLICY "profiles_select_own" ON profiles
  USING ((SELECT auth.uid()) = id);

ALTER POLICY "profiles_update_own_nonrole" ON profiles
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id AND role = (SELECT get_my_role()));

ALTER POLICY "services_select_own" ON services
  USING (
    (SELECT get_my_role()) = 'atencion'
    AND (SELECT auth.uid()) = created_by
  );

ALTER POLICY "links_select_own" ON feedback_links
  USING (
    (SELECT get_my_role()) = 'atencion'
    AND (SELECT auth.uid()) = created_by
  );

ALTER POLICY "submissions_select_own_links" ON feedback_submissions
  USING (
    (SELECT get_my_role()) = 'atencion'
    AND EXISTS (
      SELECT 1 FROM feedback_links fl
      WHERE fl.id = feedback_submissions.link_id
        AND fl.created_by = (SELECT auth.uid())
    )
  );

ALTER POLICY "notification_emails_admin" ON notification_emails
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role IN ('superadmin', 'admin')
    )
  );

ALTER POLICY "galeria_admin_all" ON galeria_fotos
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role IN ('admin', 'superadmin')
    )
  );
