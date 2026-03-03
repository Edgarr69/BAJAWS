/**
 * GET /api/me
 * Retorna el perfil del usuario autenticado (id, email, full_name, role).
 */
import { NextResponse } from 'next/server';
import { getSessionInfo, serverError, unauthorized } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  // Acepta cualquier usuario autenticado, incluido rol 'pending'
  const session = await getSessionInfo();
  if (!session) return unauthorized();

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', session.userId)
    .single();

  if (error || !data) return serverError('Perfil no encontrado');

  // Obtener avatar_url del metadata de Google OAuth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const avatar_url: string | null =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture  as string | undefined) ??
    null;

  return NextResponse.json({ ...data, avatar_url });
}
