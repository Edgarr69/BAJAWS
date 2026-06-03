-- ============================================================
-- Bloquear postulaciones duplicadas (mismo correo, misma vacante)
-- ============================================================

-- Normalizar correos existentes a minúsculas para consistencia
UPDATE job_applications SET correo = lower(correo);

-- Eliminar duplicados existentes antes de crear el índice (conservar el más antiguo)
DELETE FROM job_applications a
USING job_applications b
WHERE a.posting_id = b.posting_id
  AND lower(a.correo) = lower(b.correo)
  AND a.created_at > b.created_at;

-- Índice único insensible a mayúsculas: un correo solo puede postular una vez por vacante
CREATE UNIQUE INDEX IF NOT EXISTS job_applications_posting_correo_unique
  ON job_applications (posting_id, lower(correo));
