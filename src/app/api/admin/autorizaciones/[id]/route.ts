/**
 * PUT    /api/admin/autorizaciones/[id] → actualizar
 * DELETE /api/admin/autorizaciones/[id] → eliminar
 */
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireRole, badRequest, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';
import { parseUuid } from '@/lib/validation';

const updateSchema = z.object({
  clasificacion:       z.string().min(1).max(100).optional(),
  dependencia:         z.string().min(1).max(100).optional(),
  modalidad:           z.string().min(1).max(100).optional(),
  residuo:             z.string().min(1).max(300).optional(),
  numero_autorizacion: z.string().min(1).max(100).optional(),
  vigencia:            z.string().min(1).max(50).optional(),
  display_order:       z.number().int().min(0).optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const { id: rawId } = await params;
  const id = parseUuid(rawId);
  if (!id) return badRequest('ID inválido');

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return badRequest('Payload inválido', parsed.error.flatten());

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('autorizaciones')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return serverError(error.message);
  revalidatePath('/autorizaciones');
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const { id: rawId } = await params;
  const id = parseUuid(rawId);
  if (!id) return badRequest('ID inválido');

  const admin = getAdminClient();

  const { data: prev, error: findError } = await admin
    .from('autorizaciones')
    .select('*')
    .eq('id', id)
    .single();

  if (findError || !prev) {
    return NextResponse.json({ error: 'NOT_FOUND', message: 'Autorización no encontrada' }, { status: 404 });
  }

  const { error } = await admin
    .from('autorizaciones')
    .delete()
    .eq('id', id);

  if (error) return serverError(error.message);

  await admin.from('audit_log').insert({
    actor_id:   session.userId,
    action:     'delete',
    table_name: 'autorizaciones',
    record_id:  id,
    old_data:   prev,
  });

  revalidatePath('/autorizaciones');
  return NextResponse.json({ ok: true });
}
