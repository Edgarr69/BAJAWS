/**
 * PATCH  /api/admin/job-postings/[id] → actualizar is_active (o cualquier campo)
 * DELETE /api/admin/job-postings/[id] → eliminar vacante
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, badRequest, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const patchSchema = z.object({
  titulo:       z.string().trim().min(2).max(120).optional(),
  descripcion:  z.string().trim().min(10).max(3000).optional(),
  requisitos:   z.string().trim().max(3000).nullable().optional(),
  prestaciones: z.string().trim().max(3000).nullable().optional(),
  ubicacion:    z.string().trim().min(2).max(100).optional(),
  modalidad:    z.enum(['presencial', 'remoto', 'hibrido']).optional(),
  is_active:    z.boolean().optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'Se requiere al menos un campo' });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const { id } = await params;
  if (!UUID_REGEX.test(id)) return badRequest('ID inválido');

  const body = await req.json().catch((err: unknown) => {
    console.error('[admin/job-postings/[id] PATCH] JSON parse error:', err);
    return null;
  });
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return badRequest('Payload inválido', parsed.error.flatten());

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('job_postings')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[admin/job-postings/[id] PATCH]', error);
    return serverError(error.message);
  }
  if (!data) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const { id } = await params;
  if (!UUID_REGEX.test(id)) return badRequest('ID inválido');

  const admin = getAdminClient();
  const { error } = await admin.from('job_postings').delete().eq('id', id);

  if (error) {
    console.error('[admin/job-postings/[id] DELETE]', error);
    return serverError(error.message);
  }
  return NextResponse.json({ ok: true });
}
