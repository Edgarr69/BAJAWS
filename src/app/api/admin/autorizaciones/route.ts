/**
 * GET  /api/admin/autorizaciones → listar todas
 * POST /api/admin/autorizaciones → crear nueva
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, badRequest, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

const createSchema = z.object({
  clasificacion:       z.string().min(1).max(100),
  dependencia:         z.string().min(1).max(100),
  modalidad:           z.string().min(1).max(100),
  residuo:             z.string().min(1).max(300),
  numero_autorizacion: z.string().min(1).max(100),
  vigencia:            z.string().min(1).max(50),
  display_order:       z.number().int().min(0).optional(),
});

export async function GET() {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('autorizaciones')
    .select('id, clasificacion, dependencia, modalidad, residuo, numero_autorizacion, vigencia, display_order, created_at')
    .order('display_order');

  if (error) return serverError(error.message);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest('Payload inválido', parsed.error.flatten());

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('autorizaciones')
    .insert(parsed.data)
    .select()
    .single();

  if (error) return serverError(error.message);
  return NextResponse.json(data, { status: 201 });
}
