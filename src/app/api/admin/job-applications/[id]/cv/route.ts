/**
 * GET /api/admin/job-applications/[id]/cv → genera URL firmada del CV (expira en 1h)
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireRole, badRequest, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const { id } = await params;
  if (!UUID_REGEX.test(id)) return badRequest('ID inválido');

  const admin = getAdminClient();
  const { data: app, error: appError } = await admin
    .from('job_applications')
    .select('cv_path')
    .eq('id', id)
    .single();

  if (appError || !app) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  if (!app.cv_path) return NextResponse.json({ error: 'NO_CV' }, { status: 404 });

  const { data, error } = await admin.storage
    .from('cvs')
    .createSignedUrl(app.cv_path, 3600);

  if (error || !data?.signedUrl) {
    console.error('[admin/job-applications/[id]/cv GET]', error);
    return serverError('No se pudo generar el enlace del CV');
  }

  return NextResponse.json({ url: data.signedUrl });
}
