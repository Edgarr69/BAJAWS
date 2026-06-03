/**
 * GET  /api/admin/job-postings  → listar todas las vacantes
 * POST /api/admin/job-postings  → crear vacante
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, badRequest, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

const createSchema = z.object({
  titulo:      z.string().trim().min(2).max(120),
  descripcion: z.string().trim().min(10).max(3000),
  requisitos:  z.string().trim().max(3000).optional().nullable(),
  ubicacion:   z.string().trim().min(2).max(100).default('Tijuana, B.C.'),
  modalidad:   z.enum(['presencial', 'remoto', 'hibrido']).default('presencial'),
  is_active:   z.boolean().default(true),
});

export async function GET() {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('job_postings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[admin/job-postings GET]', error);
    return serverError('No se pudieron obtener las vacantes');
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const body = await req.json().catch((err: unknown) => {
    console.error('[admin/job-postings POST] JSON parse error:', err);
    return null;
  });
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest('Payload inválido', parsed.error.flatten());

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('job_postings')
    .insert({ ...parsed.data, created_by: session.userId })
    .select()
    .single();

  if (error) {
    console.error('[admin/job-postings POST]', error);
    return serverError('No se pudo crear la vacante');
  }
  return NextResponse.json(data, { status: 201 });
}
