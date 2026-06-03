import { redirect } from 'next/navigation';
import { getSessionInfo } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';
import type { NotificationEmail } from '@/lib/api';
import { NotificacionesClient } from './NotificacionesClient';

export default async function NotificacionesPage() {
  const session = await getSessionInfo();
  if (!session || (session.role !== 'superadmin' && session.role !== 'admin')) {
    redirect('/panel/dashboard');
  }

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('notification_emails')
    .select('id, email, label, is_active, notify_postulantes, created_at')
    .order('created_at', { ascending: true });

  if (error) throw new Error('No se pudieron cargar los correos de notificación');

  return <NotificacionesClient initialItems={(data ?? []) as NotificationEmail[]} />;
}
