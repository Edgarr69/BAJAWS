import { NextResponse } from 'next/server';
import { requireRole, badRequest, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { errorResponse } = await requireRole('admin', 'superadmin');
  if (errorResponse) return errorResponse;

  const { id }      = await params;
  const body        = await request.json().catch(() => null);
  if (typeof body?.visible !== 'boolean') return badRequest('visible requerido');

  const admin = getAdminClient();
  const { error } = await admin
    .from('galeria_fotos')
    .update({ visible: body.visible })
    .eq('id', id);

  if (error) return serverError(error.message);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { errorResponse } = await requireRole('admin', 'superadmin');
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const admin  = getAdminClient();

  const { data: foto } = await admin
    .from('galeria_fotos')
    .select('storage_path')
    .eq('id', id)
    .maybeSingle();

  if (!foto) return badRequest('Foto no encontrada');

  const { error: dbError } = await admin
    .from('galeria_fotos')
    .delete()
    .eq('id', id);

  if (dbError) return serverError(dbError.message);

  if (foto.storage_path) {
    await admin.storage.from('galeria').remove([foto.storage_path]);
  }

  return NextResponse.json({ ok: true });
}
