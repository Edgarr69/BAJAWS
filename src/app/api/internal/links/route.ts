/**
 * GET /api/internal/links → listar enlaces (admin: todos, atencion: los propios)
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireRole, serverError } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function GET(_req: NextRequest) {
  const { session, errorResponse } = await requireRole('superadmin', 'admin', 'atencion');
  if (errorResponse) return errorResponse;

  const supabase = await createClient();

  let query = supabase
    .from('feedback_links')
    .select('id, code, service_id, expires_at, used_at, blocked_at, attempts, max_attempts, ttl_seconds, created_at, created_by, services(folio, service_date)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (session.role === 'atencion') {
    query = query.eq('created_by', session.userId);
  }

  const { data, error } = await query;
  if (error) return serverError(error.message);
  return NextResponse.json(data);
}
