/**
 * GET /api/internal/submissions → listar submissions con filtros (solo admin)
 * Query: date_from, date_to, topic_id
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, serverError, badRequest } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

const dateSchema = z.object({
  date_from: z.string().date().optional().nullable(),
  date_to:   z.string().date().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const { searchParams } = req.nextUrl;
  const dateParsed = dateSchema.safeParse({
    date_from: searchParams.get('date_from'),
    date_to:   searchParams.get('date_to'),
  });
  if (!dateParsed.success) return badRequest('Formato de fecha inválido (esperado YYYY-MM-DD)');
  const { date_from, date_to } = dateParsed.data;

  const admin = getAdminClient();

  const buildQuery = (withCompanyName: boolean) => {
    const select = withCompanyName
      ? `id, submitted_at, company_name, feedback_links(code), services(folio, service_date)`
      : `id, submitted_at, feedback_links(code), services(folio, service_date)`;
    let q = admin
      .from('feedback_submissions')
      .select(select)
      .order('submitted_at', { ascending: false })
      .limit(200);
    if (date_from) q = q.gte('submitted_at', date_from);
    if (date_to)   q = q.lte('submitted_at', date_to + 'T23:59:59');
    return q;
  };

  let { data, error } = await buildQuery(true);

  // Si la columna company_name aún no existe (migración pendiente), reintentar sin ella
  if (error && error.message?.toLowerCase().includes('company_name')) {
    ({ data, error } = await buildQuery(false));
  }

  if (error) return serverError(error.message);
  return NextResponse.json(data);
}
