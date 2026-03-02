'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/panel/Sidebar';
import { Topbar } from '@/components/panel/Topbar';
import { Toaster } from '@/components/ui/sonner';
import { getMe, getSolicitudes } from '@/lib/api';
import type { Profile } from '@/types/panel';
import { PanelContext } from './panel-context';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser]           = useState<Profile | null>(null);
  const [sideOpen, setSide]       = useState(false);
  const [loading, setLoading]     = useState(true);
  const [pendingCount, setPending] = useState(0);

  const refreshPending = useCallback(() => {
    getSolicitudes().then(s => setPending(s.length)).catch(() => {});
  }, []);

  useEffect(() => {
    getMe()
      .then(data => {
        const profile = data as Profile;
        if (profile.role === 'pending') {
          router.replace('/acceso-solicitado');
          return;
        }
        setUser(profile);
        if (profile.role === 'superadmin' || profile.role === 'admin') {
          refreshPending();
        }
      })
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <PanelContext.Provider value={{ pendingCount, refreshPending }}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar role={user.role} open={sideOpen} onClose={() => setSide(false)} pendingCount={pendingCount} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar user={user} onMenuClick={() => setSide(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>

        <Toaster richColors position="top-right" />
      </div>
    </PanelContext.Provider>
  );
}
