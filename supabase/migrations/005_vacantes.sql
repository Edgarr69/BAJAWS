-- ============================================================
-- Vacantes y postulaciones de empleo
-- ============================================================

-- Agregar columna notify_postulantes a notification_emails
ALTER TABLE notification_emails
  ADD COLUMN IF NOT EXISTS notify_postulantes boolean NOT NULL DEFAULT true;

-- ── Vacantes ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS job_postings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      text NOT NULL,
  descripcion text NOT NULL,
  requisitos  text,
  ubicacion   text NOT NULL DEFAULT 'Ensenada, B.C.',
  modalidad   text NOT NULL DEFAULT 'presencial'
                CHECK (modalidad IN ('presencial', 'remoto', 'hibrido')),
  is_active   boolean NOT NULL DEFAULT true,
  created_by  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_postings_public_select" ON job_postings
  FOR SELECT USING (is_active = true);

CREATE POLICY "job_postings_admin_all" ON job_postings
  FOR ALL USING (is_admin_or_above());

-- ── Postulaciones ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS job_applications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posting_id uuid REFERENCES job_postings(id) ON DELETE SET NULL,
  nombre     text NOT NULL,
  correo     text NOT NULL,
  telefono   text,
  mensaje    text,
  cv_path    text,
  ip_hash    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_applications_admin_all" ON job_applications
  FOR ALL USING (is_admin_or_above());

-- ── Storage bucket para CVs ───────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('cvs', 'cvs', false, 5242880, ARRAY['application/pdf'])
ON CONFLICT DO NOTHING;

-- Solo admins pueden ver CVs desde el cliente (el server usa service role)
CREATE POLICY "cvs_admin_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'cvs'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('superadmin', 'admin')
    )
  );
