-- ============================================================
-- SCHEMA COMPLETO — Baja Wastewater Solution
-- Reconstruido desde código fuente + RLS del Dashboard.
-- Los cuerpos de RPC se deben completar desde Supabase Dashboard
-- (Database → Functions) y pegar en la sección de RPCs al final.
-- ============================================================

-- ── Helper de roles ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION is_admin_or_above()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('superadmin', 'admin')
  );
$$;

-- ── Tablas ───────────────────────────────────────────────────────────────────

-- Perfiles de usuario (espeja auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  full_name   text,
  role        text NOT NULL DEFAULT 'pending'
                CHECK (role IN ('superadmin', 'admin', 'atencion', 'pending')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (is_admin_or_above());

CREATE POLICY "profiles_update_own_nonrole" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (is_admin_or_above());

-- Tópicos de evaluación
CREATE TABLE IF NOT EXISTS topics (
  id            serial PRIMARY KEY,
  name          text NOT NULL,
  display_order integer NOT NULL DEFAULT 0
);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "topics_select_all" ON topics
  FOR SELECT USING (true);

CREATE POLICY "topics_write_admin" ON topics
  FOR ALL USING (is_admin_or_above());

-- Preguntas del formulario de evaluación
CREATE TABLE IF NOT EXISTS questions (
  id            serial PRIMARY KEY,
  topic_id      integer REFERENCES topics(id) ON DELETE SET NULL,
  text          text NOT NULL,
  type          text NOT NULL DEFAULT 'likert'
                  CHECK (type IN ('likert', 'open', 'yesno')),
  is_active     boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "questions_select_all" ON questions
  FOR SELECT USING (true);

CREATE POLICY "questions_write_admin" ON questions
  FOR ALL USING (is_admin_or_above());

-- Servicios prestados (opcionales, asociados a un enlace de feedback)
CREATE TABLE IF NOT EXISTS services (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folio        text,
  service_date date,
  created_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid REFERENCES profiles(id)
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_select_admin" ON services
  FOR SELECT USING (is_admin_or_above());

CREATE POLICY "services_select_own" ON services
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "services_write_admin" ON services
  FOR ALL USING (is_admin_or_above());

-- Enlaces cortos para formularios de evaluación
CREATE TABLE IF NOT EXISTS feedback_links (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code         text NOT NULL UNIQUE,
  service_id   uuid REFERENCES services(id) ON DELETE SET NULL,
  expires_at   timestamptz NOT NULL,
  used_at      timestamptz,
  blocked_at   timestamptz,
  attempts     integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  ttl_seconds  integer NOT NULL DEFAULT 3600,
  created_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid REFERENCES profiles(id)
);

ALTER TABLE feedback_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_links_select_admin" ON feedback_links
  FOR SELECT USING (is_admin_or_above());

CREATE POLICY "feedback_links_select_own" ON feedback_links
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "feedback_links_write_admin" ON feedback_links
  FOR ALL USING (is_admin_or_above());

-- Respuestas de formularios de evaluación
CREATE TABLE IF NOT EXISTS feedback_submissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id         uuid REFERENCES feedback_links(id) ON DELETE CASCADE,
  submitted_at    timestamptz NOT NULL DEFAULT now(),
  ip_hash         text,
  company_name    text,
  private_comment text
);

ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "submissions_select_admin" ON feedback_submissions
  FOR SELECT USING (is_admin_or_above());

-- Respuestas individuales por pregunta
CREATE TABLE IF NOT EXISTS answers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES feedback_submissions(id) ON DELETE CASCADE,
  question_id   integer REFERENCES questions(id),
  value_int     integer CHECK (value_int BETWEEN 1 AND 5),
  value_text    text
);

ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "answers_select_admin" ON answers
  FOR SELECT USING (is_admin_or_above());

-- Solicitudes de contacto desde el sitio público
CREATE TABLE IF NOT EXISTS contact_requests (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     text NOT NULL,
  telefono   text,
  correo     text NOT NULL,
  mensaje    text NOT NULL,
  fuente     text NOT NULL CHECK (fuente IN ('contacto', 'cotizacion')),
  ip_hash    text,
  read_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_requests_select_admin" ON contact_requests
  FOR SELECT USING (is_admin_or_above());

CREATE POLICY "contact_requests_insert_public" ON contact_requests
  FOR INSERT WITH CHECK (true);

-- Auditoría de acciones administrativas
CREATE TABLE IF NOT EXISTS audit_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action     text NOT NULL,
  table_name text,
  record_id  text,
  old_data   jsonb,
  new_data   jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_select_superadmin" ON audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- ── RPCs (completar desde Dashboard → Database → Functions) ─────────────────
--
-- Las siguientes funciones existen en producción pero sus cuerpos deben
-- copiarse manualmente desde Supabase Dashboard → Database → Functions:
--
--   create_feedback_link(p_service_id uuid, p_ttl_seconds integer)
--   get_public_form(p_code text)
--   submit_feedback(p_code text, p_answers jsonb, p_ip_hash text)
--   export_metrics_aggregate(date_from text, date_to text, group_by text)
--   export_raw_answers(date_from text, date_to text)
--
-- Pasos para exportar:
-- 1. Supabase Dashboard → Database → Functions
-- 2. Click en cada función → copiar el SQL de definición
-- 3. Pegar aquí como CREATE OR REPLACE FUNCTION ...
