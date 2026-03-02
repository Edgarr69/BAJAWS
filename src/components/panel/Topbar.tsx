'use client';

import { Menu, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Profile } from '@/types/panel';

interface TopbarProps {
  user: Profile | null;
  onMenuClick: () => void;
}

export function Topbar({ user, onMenuClick }: TopbarProps) {
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' });
    window.location.href = '/login';
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-800 leading-tight">
            {user?.full_name ?? user?.email ?? '…'}
          </p>
          <p className="text-xs text-slate-400">{user?.email}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none">
              <Avatar className="w-8 h-8 bg-primary-700 cursor-pointer">
                <AvatarFallback className="bg-primary-700 text-white text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-2 text-red-600 focus:text-red-600"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
