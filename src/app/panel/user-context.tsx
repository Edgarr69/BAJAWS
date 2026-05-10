'use client';

import { createContext, useContext } from 'react';
import type { Profile } from '@/types/panel';

const UserContext = createContext<Profile | null>(null);

export function UserProvider({ user, children }: { user: Profile; children: React.ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function usePanelUser(): Profile {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('usePanelUser debe usarse dentro de UserProvider');
  return ctx;
}
