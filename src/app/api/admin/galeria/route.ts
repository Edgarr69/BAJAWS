import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireRole, badRequest, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const { errorResponse } = await requireRole('admin', 'superadmin');
  if (errorResponse) return errorResponse;

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('galeria_fotos')
    .select('*')
    .order('orden');

  if (error) return serverError(error.message);
  return NextResponse.json({ fotos: data });
}

export async function PATCH(request: Request) {
  const { errorResponse } = await requireRole('admin', 'superadmin');
  if (errorResponse) return errorResponse;

  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.items)) return badRequest('items requerido');

  const admin = getAdminClient();

  await Promise.all(
    (body.items as { id: string; orden: number }[]).map(({ id, orden }) =>
      admin.from('galeria_fotos').update({ orden }).eq('id', id)
    )
  );

  revalidatePath('/nosotros');
  return NextResponse.json({ ok: true });
}
