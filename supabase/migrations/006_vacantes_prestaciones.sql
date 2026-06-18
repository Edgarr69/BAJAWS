-- Agregar columna de prestaciones a vacantes
ALTER TABLE job_postings
  ADD COLUMN IF NOT EXISTS prestaciones text;
