/**
 * PUT    /api/admin/autorizaciones/[id] → actualizar
 * DELETE /api/admin/autorizaciones/[id] → eliminar
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, badRequest, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

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

  const { id } = await params;
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
    .from('autorizaciones')
    .delete()
    .eq('id', id);

  if (error) return serverError(error.message);
  return NextResponse.json({ ok: true });
}
