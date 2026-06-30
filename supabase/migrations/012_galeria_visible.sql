-- Agrega columna visible a galeria_fotos (true = aparece en el sitio)
alter table public.galeria_fotos
  add column if not exists visible boolean not null default true;
