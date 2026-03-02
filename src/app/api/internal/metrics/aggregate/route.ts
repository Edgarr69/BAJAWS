/**
 * GET /api/internal/metrics/aggregate
 * Métricas agregadas: disponible para admin y atencion.
 * atencion NO puede ver respuestas raw (solo este endpoint agregado).
 *
 * Query params:
 *   date_from  YYYY-MM-DD  (opcional)
 *   date_to    YYYY-MM-DD  (opcional)
 *   group_by   topic | question | day | week  (default: topic)
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, badRequest, serverError } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  group_by:  z.enum(['topic', 'question', 'day', 'week']).default('topic'),
});

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireRole('superadmin', 'admin', 'atencion');
  if (errorResponse) return errorResponse;

  const params = Object.fromEntries(req.nextUrl.searchParams);
  const parsed = schema.safeParse(params);
  if (!parsed.success) return badRequest('Parámetros inválidos', parsed.error.flatten());

  const { date_from, date_to, group_by } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('export_metrics_aggregate', {
    p_date_from: date_from ?? null,
    p_date_to:   date_to   ?? null,
    p_group_by:  group_by,
  });

  if (error) return serverError(error.message);
  if (data?.error) {
    return NextResponse.json(data, { status: data.error === 'FORBIDDEN' ? 403 : 400 });
  }

  // Normalizar: el RPC puede devolver el array directo o { data: [...] }
  const rows: unknown[] = Array.isArray(data)
    ? data
    : Array.isArray((data as Record<string, unknown>)?.data)
      ? (data as Record<string, unknown[]>).data
      : [];

  return NextResponse.json({ ok: true, data: rows });
}
