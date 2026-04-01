-- Tabla de autorizaciones oficiales (SEMARNAT, CESPT, SEMAR, SCT, etc.)
CREATE TABLE IF NOT EXISTS autorizaciones (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clasificacion        text NOT NULL DEFAULT '',
  dependencia          text NOT NULL DEFAULT '',
  modalidad            text NOT NULL DEFAULT '',
  residuo              text NOT NULL DEFAULT '',
  numero_autorizacion  text NOT NULL DEFAULT '',
  vigencia             text NOT NULL DEFAULT '',
  display_order        integer NOT NULL DEFAULT 0,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE autorizaciones ENABLE ROW LEVEL SECURITY;

-- Lectura pública (se muestra en la página de autorizaciones del sitio)
CREATE POLICY "autorizaciones_select_public" ON autorizaciones
  FOR SELECT USING (true);

-- Datos iniciales (tomados de site.ts)
INSERT INTO autorizaciones (clasificacion, dependencia, modalidad, residuo, numero_autorizacion, vigencia, display_order) VALUES
  ('Peligrosos',       'SEMARNAT', 'Transporte', 'Residuos líquidos, sólidos y semisólidos CTI',          '02-004-PS-I-05-D-2015',          '26/10/2025',    1),
  ('Peligrosos',       'SEMARNAT', 'Acopio',     'Residuos líquidos, sólidos y semisólidos CTI',          '02-004-PS-II-12-D-2009',         '25/02/2029',    2),
  ('Peligrosos',       'SEMARNAT', 'Acopio',     'Residuos líquidos, sólidos y semisólidos CTI',          '02-004-PS-II-06-D-2014',         '26/06/2034',    3),
  ('Peligrosos',       'SEMARNAT', 'Tratamiento','Residuos líquidos acuosos CT',                          '02-V-20-21 PRORROGA',            '28/07/2031',    4),
  ('Manejo especial',  'SMADS BC', 'Transporte', 'Residuos líquidos, sólidos y semisólidos no peligrosos','PS/TIJ-256/19',                  'En renovación', 5),
  ('Aguas residuales', 'CESPT',    'Descarga',   'Aguas residuales tratadas',                             'TIJ-5-001/5/16',                 '21/03/2025',    6),
  ('General',          'SEMAR',    'Manejo',     'Residuos líquidos, sólidos y semisólidos CTI',          'UNICAPAM-MIYII-ENSE-003',        '24/06/2029',    7),
  ('General',          'SCT',      'Transporte', 'Carga general líquida, sólida o semisólida',            '0202AALJ01092015230301000',      'Indefinido',    8);
