/**
 * GET  /api/admin/questions  → listar todas (con topic)
 * POST /api/admin/questions  → crear nueva pregunta
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, badRequest, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

const createSchema = z.object({
  topic_id:      z.number().int().positive(),
  text:          z.string().min(5).max(500),
  display_order: z.number().int().min(0).optional(),
});

export async function GET() {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('questions')
    .select('id, topic_id, text, type, is_active, display_order, topics(name)')
    .order('display_order');

  if (error) return serverError(error.message);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest('Payload inválido', parsed.error.flatten());

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('questions')
    .insert({ ...parsed.data, created_by: session.userId })
    .select()
    .single();

  if (error) return serverError(error.message);
  return NextResponse.json(data, { status: 201 });
}
