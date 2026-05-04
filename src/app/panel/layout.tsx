import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PanelShell } from './panel-shell';
import type { Profile } from '@/types/panel';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // Verifica la sesión activa del usuario
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Obtiene el perfil con el rol desde la tabla profiles
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    redirect('/login');
  }

  if (profile.role === 'pending') {
    redirect('/acceso-solicitado');
  }

  return <PanelShell user={profile as Profile}>{children}</PanelShell>;
}
