import { redirect } from 'next/navigation';
import { getSessionInfo } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';
import type { JobPosting } from '@/types/panel';
import { VacantesClient } from './VacantesClient';

export default async function VacantesPage() {
  const session = await getSessionInfo();
  if (!session || (session.role !== 'superadmin' && session.role !== 'admin')) {
    redirect('/panel/dashboard');
  }

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('job_postings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error('No se pudieron cargar las vacantes');

  return <VacantesClient initialItems={(data ?? []) as JobPosting[]} />;
}
