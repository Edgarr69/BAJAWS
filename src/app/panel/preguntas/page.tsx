import { redirect } from 'next/navigation';
import { getSessionInfo } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';
import type { Question } from '@/types/panel';
import { PreguntasClient } from './PreguntasClient';

export default async function PreguntasPage() {
  const session = await getSessionInfo();
  if (!session || (session.role !== 'superadmin' && session.role !== 'admin')) {
    redirect('/panel/dashboard');
  }

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('questions')
    .select('id, topic_id, text, type, is_active, display_order, topics(name)')
    .order('display_order');

  if (error) throw new Error('No se pudieron cargar las preguntas');

  return <PreguntasClient initialQuestions={(data ?? []) as unknown as Question[]} />;
}
