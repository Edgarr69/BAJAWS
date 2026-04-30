/**
 * POST /api/admin/users/set-role
 * Jerarquía:
 *   superadmin → puede asignar 'admin' o 'atencion' a cualquiera (menos a sí mismo)
 *   admin      → puede asignar solo 'atencion' (no puede tocar admins ni superadmins)
 *
 * Body: { user_id: string (uuid), role: 'admin' | 'atencion' }
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, badRequest, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

const schema = z.object({
  user_id: z.string().uuid('user_id debe ser un UUID válido'),
  role:    z.enum(['admin', 'atencion']),
});

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest('Payload inválido', parsed.error.flatten());

  const { user_id, role } = parsed.data;

  // Nadie puede cambiar su propio rol
  if (user_id === session.userId) {
    return NextResponse.json(
      { error: 'FORBIDDEN', message: 'No puedes cambiar tu propio rol' },
      { status: 403 }
    );
  }

  const admin = getAdminClient();

  const { data: target, error: findError } = await admin
    .from('profiles')
    .select('id, email, role')
    .eq('id', user_id)
    .single();

  if (findError || !target) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: 'Usuario no encontrado' },
      { status: 404 }
    );
  }

  // Nadie puede tocar un superadmin
  if (target.role === 'superadmin') {
    return NextResponse.json(
      { error: 'FORBIDDEN', message: 'No se puede modificar un superadmin' },
      { status: 403 }
    );
  }

  // Admin solo puede asignar 'atencion', no puede promover a 'admin'
  if (session.role === 'admin' && role === 'admin') {
    return NextResponse.json(
      { error: 'FORBIDDEN', message: 'Solo el superadmin puede asignar rol de administrador' },
      { status: 403 }
    );
  }

  // Admin no puede modificar a otro admin (ni siquiera para demoterlo)
  if (session.role === 'admin' && target.role === 'admin') {
    return NextResponse.json(
      { error: 'FORBIDDEN', message: 'Solo el superadmin puede modificar a otro administrador' },
      { status: 403 }
    );
  }

  const { error: updateError } = await admin
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', user_id);

  if (updateError) {
    // Log interno; no se expone el mensaje crudo de Supabase al cliente
    console.error('[admin/users/set-role] update failed:', updateError);
    return serverError('No se pudo actualizar el rol');
  }

  await admin.from('audit_log').insert({
    actor_id:   session.userId,
    action:     'set_role',
    table_name: 'profiles',
    record_id:  user_id,
    old_data:   { role: target.role },
    new_data:   { role },
  });

  return NextResponse.json({ ok: true, user_id, email: target.email, role });
}
