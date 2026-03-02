/**
 * GET /api/internal/answers/raw
 * Exportación raw de respuestas (pregunta → valor → comentario).
 * SOLO admin.
 *
 * Query params:
 *   date_from  YYYY-MM-DD  (opcional)
 *   date_to    YYYY-MM-DD  (opcional)
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, badRequest, serverError } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const params = Object.fromEntries(req.nextUrl.searchParams);
  const parsed = schema.safeParse(params);
  if (!parsed.success) return badRequest('Parámetros inválidos', parsed.error.flatten());

  const { date_from, date_to } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('export_raw_answers', {
    p_date_from: date_from ?? null,
    p_date_to:   date_to   ?? null,
  });

  if (error) return serverError(error.message);
  if (data?.error) {
    return NextResponse.json(data, { status: 403 });
  }

  // Normalizar: el RPC puede devolver el array directo o { data: [...] }
  const rows: unknown[] = Array.isArray(data)
    ? data
    : Array.isArray((data as Record<string, unknown>)?.data)
      ? (data as Record<string, unknown[]>).data
      : [];

  return NextResponse.json({ ok: true, data: rows });
}
