import { redirect } from 'next/navigation';
import { getSessionInfo } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';
import type { ContactRequest } from '@/types/panel';
import { ContactosClient } from './ContactosClient';

export default async function ContactosPage() {
  const session = await getSessionInfo();
  if (!session || (session.role !== 'superadmin' && session.role !== 'admin')) {
    redirect('/panel/dashboard');
  }

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('contact_requests')
    .select('id, nombre, telefono, correo, mensaje, fuente, created_at')
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) throw new Error('No se pudieron cargar los mensajes');

  return <ContactosClient initialItems={(data ?? []) as ContactRequest[]} />;
}
