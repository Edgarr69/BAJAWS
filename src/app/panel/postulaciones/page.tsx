import { redirect } from 'next/navigation';
import { getSessionInfo } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';
import type { JobApplication } from '@/types/panel';
import { PostulacionesClient } from './PostulacionesClient';

export default async function PostulacionesPage() {
  const session = await getSessionInfo();
  if (!session || (session.role !== 'superadmin' && session.role !== 'admin')) {
    redirect('/panel/dashboard');
  }

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('job_applications')
    .select('id, posting_id, nombre, correo, telefono, mensaje, cv_path, created_at, job_postings(titulo)')
    .order('created_at', { ascending: false });

  if (error) throw new Error('No se pudieron cargar las postulaciones');

  // Normalizar job_postings: Supabase puede devolver array o objeto según el join
  const normalized = (data ?? []).map(row => ({
    ...row,
    job_postings: Array.isArray(row.job_postings)
      ? (row.job_postings[0] ?? null)
      : row.job_postings,
  })) as unknown as JobApplication[];

  return <PostulacionesClient initialItems={normalized} />;
}
