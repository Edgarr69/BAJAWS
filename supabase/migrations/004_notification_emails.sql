CREATE TABLE IF NOT EXISTS notification_emails (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL UNIQUE,
  label      text NOT NULL DEFAULT '',
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notification_emails ENABLE ROW LEVEL SECURITY;

-- Solo admin y superadmin pueden gestionar los emails de notificación
CREATE POLICY "notification_emails_admin" ON notification_emails
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('superadmin', 'admin')
    )
  );
