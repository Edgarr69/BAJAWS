/**
 * GET  /api/internal/solicitudes  → lista usuarios con rol pending
 * POST /api/internal/solicitudes  → aprobar o rechazar una solicitud
 *
 * Roles: superadmin, admin
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, badRequest, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

const schema = z.object({
  user_id: z.string().uuid(),
  action:  z.enum(['aprobar', 'rechazar']),
});

export async function GET() {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .eq('role', 'pending')
    .order('created_at', { ascending: true });

  if (error) return serverError(error.message);
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest('Payload inválido', parsed.error.flatten());

  const { user_id, action } = parsed.data;

  const admin = getAdminClient();

  // Verificar que el usuario existe y es pending
  const { data: target, error: findError } = await admin
    .from('profiles')
    .select('id, email, role')
    .eq('id', user_id)
    .single();

  if (findError || !target) {
    return NextResponse.json({ error: 'NOT_FOUND', message: 'Usuario no encontrado' }, { status: 404 });
  }

  if (target.role !== 'pending') {
    return NextResponse.json({ error: 'CONFLICT', message: 'El usuario ya tiene un rol asignado' }, { status: 409 });
  }

  if (action === 'aprobar') {
    const { error: updateError } = await admin
      .from('profiles')
      .update({ role: 'atencion', updated_at: new Date().toISOString() })
      .eq('id', user_id);

    if (updateError) return serverError(updateError.message);

    try {
      await admin.from('audit_log').insert({
        actor_id:   session.userId,
        action:     'approve_access',
        table_name: 'profiles',
        record_id:  user_id,
        old_data:   { role: 'pending' },
        new_data:   { role: 'atencion' },
      });
    } catch { /* audit no crítico */ }

    return NextResponse.json({ ok: true, action: 'aprobado', email: target.email });
  }

  // rechazar → eliminar el usuario de Supabase Auth (CASCADE borra el perfil)
  const { error: deleteError } = await admin.auth.admin.deleteUser(user_id);
  if (deleteError) return serverError(deleteError.message);

  try {
    await admin.from('audit_log').insert({
      actor_id:   session.userId,
      action:     'reject_access',
      table_name: 'profiles',
      record_id:  user_id,
      old_data:   { email: target.email, role: 'pending' },
      new_data:   null,
    });
  } catch { /* audit no critico */ }

  return NextResponse.json({ ok: true, action: 'rechazado', email: target.email });
}
