-- ─────────────────────────────────────────────────────────────────────────────
-- Galería de flota — tabla, bucket de Storage y datos iniciales
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.galeria_fotos (
  id            uuid        primary key default gen_random_uuid(),
  url           text        not null,
  storage_path  text,
  alt           text        not null default 'Unidad Baja Wastewater Solution',
  width         integer     not null,
  height        integer     not null,
  orden         integer     not null,
  created_at    timestamptz not null default now()
);

alter table public.galeria_fotos enable row level security;

-- Lectura pública (FlotaGallery del sitio)
create policy "galeria_public_select"
  on public.galeria_fotos for select
  using (true);

-- Admin: escritura completa
create policy "galeria_admin_all"
  on public.galeria_fotos for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('admin', 'superadmin')
    )
  );

-- ── Storage bucket ─────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'galeria',
  'galeria',
  true,
  5242880,
  array['image/webp', 'image/jpeg', 'image/jpg', 'image/png']
)
on conflict (id) do nothing;

create policy "galeria_storage_public_read"
  on storage.objects for select
  using (bucket_id = 'galeria');

create policy "galeria_storage_admin_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'galeria'
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('admin', 'superadmin')
    )
  );

create policy "galeria_storage_admin_delete"
  on storage.objects for delete
  using (
    bucket_id = 'galeria'
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('admin', 'superadmin')
    )
  );

-- ── Datos iniciales (11 fotos actuales en public/galeria/) ────────────────
insert into public.galeria_fotos (url, storage_path, alt, width, height, orden) values
  ('/galeria/1.webp',  null, 'Unidad Baja Wastewater Solution', 1200, 1600,  1),
  ('/galeria/7.webp',  null, 'Unidad Baja Wastewater Solution', 1296, 972,   2),
  ('/galeria/2.webp',  null, 'Unidad Baja Wastewater Solution', 960,  1280,  3),
  ('/galeria/11.webp', null, 'Unidad Baja Wastewater Solution', 1600, 900,   4),
  ('/galeria/3.webp',  null, 'Unidad Baja Wastewater Solution', 1200, 1600,  5),
  ('/galeria/12.webp', null, 'Unidad Baja Wastewater Solution', 1600, 1204,  6),
  ('/galeria/10.webp', null, 'Unidad Baja Wastewater Solution', 960,  1280,  7),
  ('/galeria/9.webp',  null, 'Unidad Baja Wastewater Solution', 1600, 1204,  8),
  ('/galeria/8.webp',  null, 'Unidad Baja Wastewater Solution', 1600, 1600,  9),
  ('/galeria/14.webp', null, 'Unidad Baja Wastewater Solution', 1600, 1204, 10),
  ('/galeria/15.webp', null, 'Unidad Baja Wastewater Solution', 1352, 918,  11);
