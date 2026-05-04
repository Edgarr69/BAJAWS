import { NextResponse } from 'next/server';
import { unauthorized, serverError } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return unauthorized();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', user.id)
    .single();

  if (error || !data) return serverError('Perfil no encontrado');

  return NextResponse.json(data);
}
