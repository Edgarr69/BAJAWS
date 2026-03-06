/**
 * GET /api/internal/submissions/[id] → detalle con respuestas (solo admin)
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireRole, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const admin = getAdminClient();

  const { data: submission, error: subErr } = await admin
    .from('feedback_submissions')
    .select(`
      id, submitted_at, private_comment,
      feedback_links(code),
      services(folio, service_date)
    `)
    .eq('id', id)
    .single();

  if (subErr || !submission) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const { data: answers, error: ansErr } = await admin
    .from('feedback_answers')
    .select(`
      id, value_int, value_text,
      questions(id, text, display_order, topics(name, display_order))
    `)
    .eq('submission_id', id)
    .order('id');

  if (ansErr) return serverError(ansErr.message);

  return NextResponse.json({ submission, answers });
}
