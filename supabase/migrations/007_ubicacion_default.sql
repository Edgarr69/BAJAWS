-- ============================================================
-- 007 — Cambiar DEFAULT de ubicacion en job_postings
-- La migración 005 ya está aplicada con DEFAULT 'Ensenada, B.C.';
-- editar el archivo aplicado no modifica la base de datos.
-- Este ALTER actualiza el default real a 'Tijuana, B.C.'.
-- Solo afecta inserts futuros que no especifiquen ubicacion.
-- ============================================================

ALTER TABLE job_postings
  ALTER COLUMN ubicacion SET DEFAULT 'Tijuana, B.C.';
