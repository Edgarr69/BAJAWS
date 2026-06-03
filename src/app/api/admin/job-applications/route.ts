/**
 * GET /api/admin/job-applications  → listar postulaciones (opcional: ?posting_id=uuid)
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireRole, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const postingId = req.nextUrl.searchParams.get('posting_id');

  const admin = getAdminClient();
  let query = admin
    .from('job_applications')
    .select('id, posting_id, nombre, correo, telefono, mensaje, cv_path, created_at, job_postings(titulo)')
    .order('created_at', { ascending: false });

  if (postingId && UUID_REGEX.test(postingId)) {
    query = query.eq('posting_id', postingId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[admin/job-applications GET]', error);
    return serverError('No se pudieron obtener las postulaciones');
  }
  return NextResponse.json(data);
}
