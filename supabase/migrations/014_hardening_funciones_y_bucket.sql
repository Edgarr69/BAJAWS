-- ============================================================
-- Hardening: funciones SECURITY DEFINER y listado del bucket galeria
-- (avisos del advisor: anon_security_definer_function_executable
--  y public_bucket_allows_listing)
--
-- 1. get_my_role() e is_admin_or_above() eran ejecutables por anon
--    vía /rest/v1/rpc/*. Solo se usan dentro de políticas RLS
--    evaluadas por usuarios autenticados; ningún flujo anónimo las
--    necesita (el sitio público usa el service role y los RPCs
--    públicos son SECURITY DEFINER con owner postgres).
--    Se revoca de PUBLIC (anon hereda de ahí) y se otorga solo a
--    authenticated.
--
-- 2. El bucket público galeria tenía una política SELECT amplia en
--    storage.objects que permitía listar todos sus archivos por API.
--    Un bucket público no la necesita para servir archivos por URL
--    (/object/public/...); solo habilitaba el listado. El sitio usa
--    las URLs guardadas en galeria_fotos y el panel opera vía
--    service role, así que nada depende de listar el bucket.
-- ============================================================

-- ── 1. Funciones auxiliares de RLS ───────────────────────────

REVOKE EXECUTE ON FUNCTION public.get_my_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_admin_or_above() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_or_above() TO authenticated;

-- ── 2. Listado del bucket galeria ────────────────────────────

DROP POLICY IF EXISTS "galeria_storage_public_read" ON storage.objects;
