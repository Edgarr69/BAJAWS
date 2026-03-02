/**
 * GET    /api/internal/contactos        → lista mensajes de contacto/cotización
 * DELETE /api/internal/contactos?id=X  → eliminar un mensaje (admin/superadmin)
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireRole, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const { errorResponse } = await requireRole('superadmin', 'admin', 'atencion');
  if (errorResponse) return errorResponse;

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('contact_requests')
    .select('id, nombre, telefono, correo, mensaje, fuente, created_at')
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) return serverError(error.message);
  return NextResponse.json(data ?? []);
}

export async function DELETE(req: NextRequest) {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'MISSING_ID' }, { status: 400 });
  }

  const admin = getAdminClient();
  const { error } = await admin
    .from('contact_requests')
    .delete()
    .eq('id', id);

  if (error) return serverError(error.message);
  return NextResponse.json({ ok: true });
}
