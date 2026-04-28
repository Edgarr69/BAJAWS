/**
 * GET    /api/internal/contactos        → lista mensajes de contacto/cotización
 * DELETE /api/internal/contactos?id=X  → eliminar un mensaje (admin/superadmin)
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, serverError, badRequest } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const { errorResponse } = await requireRole('superadmin', 'admin');
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

  const rawId = req.nextUrl.searchParams.get('id');
  const parsed = z.string().uuid().safeParse(rawId);
  if (!parsed.success) return badRequest('ID inválido o ausente');

  const admin = getAdminClient();
  const { error } = await admin
    .from('contact_requests')
    .delete()
    .eq('id', parsed.data);

  if (error) return serverError(error.message);
  return NextResponse.json({ ok: true });
}
