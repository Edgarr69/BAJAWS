-- Cambiar FK de job_applications a CASCADE para que al borrar una vacante
-- se borren también sus postulaciones automáticamente.
ALTER TABLE job_applications
  DROP CONSTRAINT job_applications_posting_id_fkey;

ALTER TABLE job_applications
  ADD CONSTRAINT job_applications_posting_id_fkey
  FOREIGN KEY (posting_id) REFERENCES job_postings(id) ON DELETE CASCADE;

-- Limpiar postulaciones huérfanas que quedaron de vacantes ya eliminadas
DELETE FROM job_applications WHERE posting_id IS NULL;
