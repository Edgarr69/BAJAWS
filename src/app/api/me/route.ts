/**
 * GET /api/me
 * Retorna el perfil del usuario autenticado (id, email, full_name, role).
 */
import { NextResponse } from 'next/server';
import { getSessionInfo, serverError, unauthorized } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

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

  return NextResponse.json(data);
}
