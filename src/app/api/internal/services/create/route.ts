/**
 * POST /api/internal/services/create
 * Crea un registro mínimo de servicio (folio) para asociar a evaluaciones.
 * Roles: admin, atencion
 *
 * Body: { folio?: string, service_date?: string (YYYY-MM-DD), notes?: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, badRequest, serverError } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  folio:        z.string().max(100).optional(),
  service_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  notes:        z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireRole('superadmin', 'admin', 'atencion');
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest('Payload inválido', parsed.error.flatten());

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('services')
    .insert({ ...parsed.data, created_by: session.userId })
    .select('id, folio, service_date, notes, created_at')
    .single();

  if (error) return serverError(error.message);

  return NextResponse.json({ ok: true, service: data }, { status: 201 });
}
