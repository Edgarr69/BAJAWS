/**
 * GET /api/internal/links → listar enlaces (admin: todos, atencion: los propios)
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, serverError, badRequest } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const dateSchema = z.object({
  date_from: z.string().date().optional().nullable(),
  date_to:   z.string().date().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const { session, errorResponse } = await requireRole('superadmin', 'admin', 'atencion');
  if (errorResponse) return errorResponse;

  const supabase = await createClient();
  const statsOnly = req.nextUrl.searchParams.get('_stats') === '1';

  const dateParsed = dateSchema.safeParse({
    date_from: req.nextUrl.searchParams.get('date_from'),
    date_to:   req.nextUrl.searchParams.get('date_to'),
  });
  if (!dateParsed.success) return badRequest('Formato de fecha inválido (esperado YYYY-MM-DD)');
  const { date_from, date_to } = dateParsed.data;

  let query = supabase
    .from('feedback_links')
    .select(statsOnly
      ? 'used_at'
      : 'id, code, service_id, expires_at, used_at, blocked_at, attempts, max_attempts, ttl_seconds, created_at, created_by, services(folio, service_date)')
    .order('created_at', { ascending: false })
    .limit(statsOnly ? 1000 : 100);

  if (session.role === 'atencion') query = query.eq('created_by', session.userId);
  if (date_from) query = query.gte('created_at', date_from);
  if (date_to)   query = query.lte('created_at', date_to + 'T23:59:59');

  const { data, error } = await query;
  if (error) return serverError(error.message);
  return NextResponse.json(data);
}
