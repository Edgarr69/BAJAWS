-- ============================================================
-- 009 — Hardening de grants y policies (advisors 2026-06-10)
-- SEGURA DE APLICAR DE INMEDIATO: ninguna ruta del código usa
-- estos caminos (verificado contra src/app/api/**).
-- ============================================================

-- contact_requests tenía INSERT abierto a public con CHECK (true):
-- cualquiera con la anon key podía insertar spam directo vía
-- /rest/v1/contact_requests, saltándose el rate limit de /api/contact.
-- El código inserta con service role (bypasa RLS), la policy sobra.
DROP POLICY IF EXISTS contact_insert_public ON contact_requests;

-- RPCs internos: solo se llaman con sesión de usuario (authenticated)
-- desde los routes de /api/internal. anon nunca los invoca legítimamente
-- y son SECURITY DEFINER — defensa en profundidad.
-- Nota: Postgres otorga EXECUTE a PUBLIC por default — revocar solo de
-- anon no surte efecto porque el privilegio se hereda de PUBLIC.
REVOKE EXECUTE ON FUNCTION public.create_feedback_link(uuid, integer)        FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.export_metrics_aggregate(date, date, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.export_raw_answers(date, date)             FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.create_feedback_link(uuid, integer)        TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.export_metrics_aggregate(date, date, text) TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.export_raw_answers(date, date)             TO authenticated, service_role;

-- Función de trigger de auth: jamás debe ser invocable vía PostgREST.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
