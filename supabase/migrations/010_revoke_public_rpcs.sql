-- ============================================================
-- 010 — Revocar acceso directo a los RPCs públicos vía PostgREST
--
-- IMPORTANTE: aplicar SOLO DESPUÉS de desplegar el código que
-- cambia /api/public/form y /api/public/submit a service role.
-- Si se aplica antes del deploy, el formulario público en
-- producción deja de funcionar (las rutas viejas llaman los RPC
-- como anon).
--
-- Cierra el bypass actual: cualquiera con la anon key puede llamar
-- /rest/v1/rpc/submit_feedback y /rest/v1/rpc/get_public_form
-- directamente, saltándose el rate limit, CSRF y anti-enumeración
-- de las API routes.
-- ============================================================

-- Revocar también de PUBLIC: el privilegio se hereda de ahí por default.
REVOKE EXECUTE ON FUNCTION public.get_public_form(text)              FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.submit_feedback(text, jsonb, text) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_public_form(text)              TO service_role;
GRANT  EXECUTE ON FUNCTION public.submit_feedback(text, jsonb, text) TO service_role;
