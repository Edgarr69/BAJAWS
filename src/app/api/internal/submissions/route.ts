/**
 * GET /api/internal/submissions → listar submissions con filtros (solo admin)
 * Query: date_from, date_to, topic_id
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireRole, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const { searchParams } = req.nextUrl;
  const date_from = searchParams.get('date_from');
  const date_to   = searchParams.get('date_to');

  const admin = getAdminClient();
  let query = admin
    .from('feedback_submissions')
    .select(`
      id, submitted_at, ip_hash,
      feedback_links(code, ttl_seconds),
      services(folio, service_date)
    `)
    .order('submitted_at', { ascending: false })
    .limit(200);

  if (date_from) query = query.gte('submitted_at', date_from);
  if (date_to)   query = query.lte('submitted_at', date_to + 'T23:59:59');

  const { data, error } = await query;
  if (error) return serverError(error.message);
  return NextResponse.json(data);
}
