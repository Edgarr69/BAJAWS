/**
 * POST /api/auth/signout
 * Cierra la sesión server-side para que las cookies SSR se eliminen correctamente.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
