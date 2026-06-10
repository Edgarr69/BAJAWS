/**
 * DELETE /api/admin/reset-all?confirm=RESET_ALL → elimina todos los enlaces, submissions y servicios (SOLO superadmin)
 * DELETE /api/admin/reset-all?code=X            → elimina un enlace individual por código (admin y superadmin)
 * El borrado masivo requiere ?confirm=RESET_ALL para prevenir ejecución accidental.
 * Ambas operaciones quedan registradas en audit_log.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSessionInfo, unauthorized, forbidden, serverError, badRequest } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

export async function DELETE(req: NextRequest) {
  const session = await getSessionInfo();
  if (!session) return unauthorized();
  if (session.role !== 'superadmin' && session.role !== 'admin') return forbidden();

  const code    = req.nextUrl.searchParams.get('code')?.toUpperCase().trim();
  const confirm = req.nextUrl.searchParams.get('confirm');
  const admin   = getAdminClient();

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
      if (subError2) return serverError();
      subsToDelete = subs2;
    }

    // Eliminar answers y submissions del link
    if (subsToDelete && subsToDelete.length > 0) {
      const ids = subsToDelete.map((s: { id: string }) => s.id);
      const { error: ansDelError } = await admin
        .from('feedback_answers')
        .delete()
        .in('submission_id', ids);
      if (ansDelError) return serverError();

      const { error: subDelError } = await admin
        .from('feedback_submissions')
        .delete()
        .in('id', ids);
      if (subDelError) return serverError();
    }

    // Eliminar el link
    const { error: linkError } = await admin
      .from('feedback_links')
      .delete()
      .eq('id', link.id);
    if (linkError) return serverError();

    // Eliminar el servicio asociado si existe
    if (link.service_id) {
      await admin.from('services').delete().eq('id', link.service_id);
    }

    await admin.from('audit_log').insert({
      actor_id:   session.userId,
      action:     'delete',
      table_name: 'feedback_links',
      record_id:  link.id,
      old_data:   { id: link.id, code, service_id: link.service_id },
    });

    return NextResponse.json({ ok: true });
  }

  // ── Eliminar todo — SOLO superadmin + token de confirmación explícito ──────
  if (session.role !== 'superadmin') return forbidden();

  if (confirm !== 'RESET_ALL') {
    return NextResponse.json(
      { error: 'CONFIRMATION_REQUIRED', message: 'Se requiere ?confirm=RESET_ALL para borrar todos los datos' },
      { status: 400 }
    );
  }

  const { error: ansError } = await admin
    .from('feedback_answers')
    .delete()
    .not('id', 'is', null);
  if (ansError) return serverError();

  const { error: subError } = await admin
    .from('feedback_submissions')
    .delete()
    .not('id', 'is', null);
  if (subError) return serverError();

  const { error: linkError } = await admin
    .from('feedback_links')
    .delete()
    .not('id', 'is', null);
  if (linkError) return serverError();

  const { error: svcError } = await admin
    .from('services')
    .delete()
    .not('id', 'is', null);
  if (svcError) return serverError();

  await admin.from('audit_log').insert({
    actor_id: session.userId,
    action:   'reset_all',
    old_data: { tables: ['feedback_answers', 'feedback_submissions', 'feedback_links', 'services'] },
  });

  return NextResponse.json({ ok: true });
}
