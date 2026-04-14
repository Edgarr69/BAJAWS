/**
 * POST /api/auth/signout
 * Cierra la sesión server-side para que las cookies SSR se eliminen correctamente.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionInfo, unauthorized } from '@/lib/auth';

export async function POST() {
  const session = await getSessionInfo();
  if (!session) return unauthorized();

  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
