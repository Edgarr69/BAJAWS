import { redirect } from 'next/navigation';
import { getSessionInfo } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';
import type { Question, Topic } from '@/types/panel';
import { PreguntasClient } from './PreguntasClient';

export default async function PreguntasPage() {
  const session = await getSessionInfo();
  if (!session || (session.role !== 'superadmin' && session.role !== 'admin')) {
    redirect('/panel/dashboard');
  }

  const admin = getAdminClient();
  const [{ data: questionsData, error }, { data: topicsData }] = await Promise.all([
    admin
      .from('questions')
      .select('id, topic_id, text, type, is_active, display_order, topics(name)')
      .order('display_order'),
    admin
      .from('topics')
      .select('id, name, display_order')
      .order('display_order'),
  ]);

  if (error) throw new Error('No se pudieron cargar las preguntas');

  return (
    <PreguntasClient
      initialQuestions={(questionsData ?? []) as unknown as Question[]}
      topics={(topicsData ?? []) as Topic[]}
    />
  );
}
