/**
 * PATCH  /api/admin/notification-emails/[id] → actualizar { is_active?, label? }
 * DELETE /api/admin/notification-emails/[id] → eliminar por id
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, badRequest, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const patchSchema = z.object({
  is_active:          z.boolean().optional(),
  label:              z.string().min(1, 'El label no puede estar vacío').max(100).optional(),
  notify_postulantes: z.boolean().optional(),
}).refine(
  (data) => data.is_active !== undefined || data.label !== undefined || data.notify_postulantes !== undefined,
  { message: 'Se requiere al menos un campo' }
);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const { id } = await params;
  if (!UUID_REGEX.test(id)) return badRequest('ID inválido');

  const body = await req.json().catch((err: unknown) => {
    console.error('[admin/notification-emails/[id] PATCH] error al parsear JSON del body:', err);
    return null;
  });
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return badRequest('Payload inválido', parsed.error.flatten());

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('notification_emails')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[admin/notification-emails/[id] PATCH] update failed:', error);
    return serverError(error.message);
  }
  if (!data) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: 'Email de notificación no encontrado' },
      { status: 404 }
    );
  }
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const { id } = await params;
  if (!UUID_REGEX.test(id)) return badRequest('ID inválido');

  const admin = getAdminClient();

  const { data: prev, error: findError } = await admin
    .from('notification_emails')
    .select('*')
    .eq('id', id)
    .single();

  if (findError || !prev) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: 'Email de notificación no encontrado' },
      { status: 404 }
    );
  }

  const { error } = await admin
    .from('notification_emails')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[admin/notification-emails/[id] DELETE] delete failed:', error);
    return serverError(error.message);
  }

  await admin.from('audit_log').insert({
    actor_id:   session.userId,
    action:     'delete',
    table_name: 'notification_emails',
    record_id:  id,
    old_data:   prev,
  });

  return NextResponse.json({ ok: true });
}
