/**
 * PUT    /api/admin/questions/[id] → actualizar
 * DELETE /api/admin/questions/[id] → eliminar
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, badRequest, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

const updateSchema = z.object({
  text:          z.string().min(5).max(500).optional(),
  is_active:     z.boolean().optional(),
  display_order: z.number().int().min(0).optional(),
  topic_id:      z.number().int().positive().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (!Number.isInteger(numId) || numId <= 0) return badRequest('ID inválido');

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return badRequest('Payload inválido', parsed.error.flatten());

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('questions')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', numId)
    .select()
    .single();

  if (error) return serverError(error.message);
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (!Number.isInteger(numId) || numId <= 0) return badRequest('ID inválido');

  const admin = getAdminClient();

  const { data: prev, error: findError } = await admin
    .from('questions')
    .select('*')
    .eq('id', numId)
    .single();

  if (findError || !prev) {
    return NextResponse.json({ error: 'NOT_FOUND', message: 'Pregunta no encontrada' }, { status: 404 });
  }

  const { error } = await admin
    .from('questions')
    .delete()
    .eq('id', numId);

  if (error) return serverError(error.message);

  await admin.from('audit_log').insert({
    actor_id:   session.userId,
    action:     'delete',
    table_name: 'questions',
    record_id:  String(numId),
    old_data:   prev,
  });

  return NextResponse.json({ ok: true });
}
