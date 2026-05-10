import { redirect } from 'next/navigation';
import { getSessionInfo } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';
import type { Autorizacion } from '@/types/panel';
import { AutorizacionesClient } from './AutorizacionesClient';

export default async function AutorizacionesPage() {
  const session = await getSessionInfo();
  if (!session || (session.role !== 'superadmin' && session.role !== 'admin')) {
    redirect('/panel/dashboard');
  }

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('autorizaciones')
    .select('id, clasificacion, dependencia, modalidad, residuo, numero_autorizacion, vigencia, display_order, created_at')
    .order('display_order');

  if (error) throw new Error('No se pudieron cargar las autorizaciones');

  return <AutorizacionesClient initialRows={(data ?? []) as Autorizacion[]} />;
}
