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
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return badRequest('Payload inválido', parsed.error.flatten());

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('questions')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', Number(id))
    .select()
    .single();

  if (error) return serverError(error.message);
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const admin = getAdminClient();
  const { error } = await admin
    .from('questions')
    .delete()
    .eq('id', Number(id));

  if (error) return serverError(error.message);
  return NextResponse.json({ ok: true });
}
