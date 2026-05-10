'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/panel/Sidebar';
import { Topbar } from '@/components/panel/Topbar';
import { Toaster } from '@/components/ui/sonner';
import { UserProvider } from './user-context';
import type { Profile } from '@/types/panel';

interface PanelShellProps {
  user: Profile;
  children: React.ReactNode;
}

export function PanelShell({ user, children }: PanelShellProps) {
  const [sideOpen, setSide] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Enlace de accesibilidad para saltar al contenido principal */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-primary-900 focus:font-semibold focus:rounded-lg focus:shadow-lg"
      >
        Ir al contenido principal
      </a>

      <Sidebar role={user.role} open={sideOpen} onClose={() => setSide(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar user={user} onMenuClick={() => setSide(true)} />
        <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-6">
          <UserProvider user={user}>{children}</UserProvider>
        </main>
      </div>

      <Toaster richColors position="top-right" />
    </div>
  );
}
