import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireRole, badRequest, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const { errorResponse } = await requireRole('admin', 'superadmin');
  if (errorResponse) return errorResponse;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return badRequest('FormData invalido');
  }

  const file   = formData.get('file') as File | null;
  const width  = parseInt((formData.get('width')  as string) ?? '0', 10);
  const height = parseInt((formData.get('height') as string) ?? '0', 10);
  const alt    = (formData.get('alt') as string) || 'Unidad Baja Wastewater Solution';

  if (!file || !width || !height) return badRequest('Datos incompletos');

  const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const filename = `${Date.now()}.${ext}`;
  const buffer   = await file.arrayBuffer();

  const admin = getAdminClient();

  const { error: uploadError } = await admin.storage
    .from('galeria')
    .upload(filename, buffer, { contentType: file.type, upsert: false });

  if (uploadError) return serverError(uploadError.message);

  const { data: { publicUrl } } = admin.storage
    .from('galeria')
    .getPublicUrl(filename);

  const { data: maxRow } = await admin
    .from('galeria_fotos')
    .select('orden')
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle();

  const orden = (maxRow?.orden ?? 0) + 1;

  const { data: foto, error: dbError } = await admin
    .from('galeria_fotos')
    .insert({ url: publicUrl, storage_path: filename, alt, width, height, orden })
    .select()
    .single();

  if (dbError) {
    await admin.storage.from('galeria').remove([filename]);
    return serverError(dbError.message);
  }

  revalidatePath('/nosotros');
  return NextResponse.json({ ok: true, foto }, { status: 201 });
}
