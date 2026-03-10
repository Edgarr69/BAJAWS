/**
 * DELETE /api/admin/reset-all        → elimina todos los enlaces, submissions y servicios
 * DELETE /api/admin/reset-all?code=X → elimina un enlace individual por código
 * Solo accesible para admin y superadmin.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireRole, serverError, badRequest } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

export async function DELETE(req: NextRequest) {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const code = req.nextUrl.searchParams.get('code')?.toUpperCase().trim();
  const admin = getAdminClient();

  // ── Eliminar enlace individual por código ─────────────────────────────────
  if (code) {
    // Obtener el link
    const { data: link, error: findError } = await admin
      .from('feedback_links')
      .select('id, service_id')
      .eq('code', code)
      .single();

    if (findError || !link) return badRequest('Código no encontrado');

    // Obtener IDs de submissions asociadas al link
    const { data: subs, error: subsSelectError } = await admin
      .from('feedback_submissions')
      .select('id')
      .eq('link_id', link.id);

    // Si falla con link_id, intentar con feedback_link_id
    let subsToDelete = subs;
    if (subsSelectError) {
      const { data: subs2, error: subError2 } = await admin
        .from('feedback_submissions')
        .select('id')
        .eq('feedback_link_id', link.id);
      if (subError2) return serverError(subError2.message);
      subsToDelete = subs2;
    }

    // Eliminar submissions (cascade a answers vía FK)
    if (subsToDelete && subsToDelete.length > 0) {
      const ids = subsToDelete.map((s: { id: string }) => s.id);
      const { error: subDelError } = await admin
        .from('feedback_submissions')
        .delete()
        .in('id', ids);
      if (subDelError) return serverError(subDelError.message);
    }

    // Eliminar el link
    const { error: linkError } = await admin
      .from('feedback_links')
      .delete()
      .eq('id', link.id);
    if (linkError) return serverError(linkError.message);

    // Eliminar el servicio asociado si existe
    if (link.service_id) {
      await admin.from('services').delete().eq('id', link.service_id);
    }

    return NextResponse.json({ ok: true });
  }

  // ── Eliminar todo ─────────────────────────────────────────────────────────
  const { error: subError } = await admin
    .from('feedback_submissions')
    .delete()
    .not('id', 'is', null);
  if (subError) return serverError(subError.message);

  const { error: linkError } = await admin
    .from('feedback_links')
    .delete()
    .not('id', 'is', null);
  if (linkError) return serverError(linkError.message);

  const { error: svcError } = await admin
    .from('services')
    .delete()
    .not('id', 'is', null);
  if (svcError) return serverError(svcError.message);

  return NextResponse.json({ ok: true });
}
