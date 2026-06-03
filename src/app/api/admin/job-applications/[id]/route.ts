/**
 * DELETE /api/admin/job-applications/[id] → eliminar postulación
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireRole, badRequest, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const { id } = await params;
  if (!UUID_REGEX.test(id)) return badRequest('ID inválido');

  const admin = getAdminClient();

  // Obtener cv_path para eliminar el archivo si existe
  const { data: app } = await admin
    .from('job_applications')
    .select('cv_path')
    .eq('id', id)
    .single();

  const { error } = await admin.from('job_applications').delete().eq('id', id);
  if (error) {
    console.error('[admin/job-applications/[id] DELETE]', error);
    return serverError(error.message);
  }

  // Eliminar CV del storage si existe (no bloquear si falla)
  if (app?.cv_path) {
    await admin.storage.from('cvs').remove([app.cv_path]).catch((err: unknown) => {
      console.error('[admin/job-applications/[id] DELETE] storage remove failed:', err);
    });
  }

  return NextResponse.json({ ok: true });
}
