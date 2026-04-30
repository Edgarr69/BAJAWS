/**
 * PUT    /api/admin/users/[id] → actualizar full_name (superadmin y admin)
 * DELETE /api/admin/users/[id] → eliminar usuario (solo superadmin)
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, badRequest, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';
import { parseUuid } from '@/lib/validation';

const updateSchema = z.object({
  full_name: z.string().max(80).optional(),
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
  const { error } = await admin
    .from('profiles')
    .update({ full_name: parsed.data.full_name ?? null, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return serverError(error.message);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireRole('superadmin');
  if (errorResponse) return errorResponse;

  const { id: rawId } = await params;
  const id = parseUuid(rawId);
  if (!id) return badRequest('ID inválido');

  if (id === session.userId) {
    return NextResponse.json(
      { error: 'FORBIDDEN', message: 'No puedes eliminar tu propia cuenta' },
      { status: 403 }
    );
  }

  const admin = getAdminClient();

  const { data: target, error: findError } = await admin
    .from('profiles')
    .select('id, role')
    .eq('id', id)
    .single();

  if (findError || !target) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: 'Usuario no encontrado' },
      { status: 404 }
    );
  }

  if (target.role === 'superadmin') {
    return NextResponse.json(
      { error: 'FORBIDDEN', message: 'No se puede eliminar un superadmin' },
      { status: 403 }
    );
  }

  // Eliminar de auth.users (ON DELETE CASCADE borra profiles automáticamente)
  const { error: deleteError } = await admin.auth.admin.deleteUser(id);
  if (deleteError) return serverError(deleteError.message);

  await admin.from('audit_log').insert({
    actor_id:   session.userId,
    action:     'delete',
    table_name: 'profiles',
    record_id:  id,
    old_data:   target,
  });

  return NextResponse.json({ ok: true });
}
