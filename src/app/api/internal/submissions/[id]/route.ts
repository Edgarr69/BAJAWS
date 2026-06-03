/**
 * GET  /api/internal/submissions/[id] → detalle con respuestas (solo admin)
 * DELETE /api/internal/submissions/[id] → eliminar submission + answers (solo admin)
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireRole, serverError, badRequest } from '@/lib/auth';
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
      feedback_links(code)
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const { id } = await params;
  if (!id) return badRequest('ID requerido');

  const admin = getAdminClient();

  // Borrar respuestas primero para no depender de que ON DELETE CASCADE
  // esté configurado en feedback_answers en el entorno de producción.
  const { error: answersErr } = await admin
    .from('feedback_answers')
    .delete()
    .eq('submission_id', id);

  if (answersErr) return serverError(answersErr.message);

  const { error } = await admin
    .from('feedback_submissions')
    .delete()
    .eq('id', id);

  if (error) return serverError(error.message);

  return NextResponse.json({ ok: true });
}
