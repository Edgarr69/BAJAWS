'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Link2, MessageSquare, HelpCircle,
  Users, Download, X, UserCheck, Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/panel';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const NAV: NavItem[] = [
  { href: '/panel/dashboard',    label: 'Dashboard',    icon: LayoutDashboard, roles: ['superadmin', 'admin', 'atencion'] },
  { href: '/panel/enlaces',      label: 'Enlaces',      icon: Link2,           roles: ['superadmin', 'admin', 'atencion'] },
  { href: '/panel/respuestas',   label: 'Respuestas',   icon: MessageSquare,   roles: ['superadmin', 'admin'] },
  { href: '/panel/preguntas',    label: 'Preguntas',    icon: HelpCircle,      roles: ['superadmin', 'admin'] },
  { href: '/panel/usuarios',     label: 'Usuarios',     icon: Users,           roles: ['superadmin', 'admin'] },
  { href: '/panel/solicitudes',  label: 'Solicitudes',  icon: UserCheck,       roles: ['superadmin', 'admin'] },
  { href: '/panel/contactos',    label: 'Contactos',    icon: Mail,            roles: ['superadmin', 'admin', 'atencion'] },
  { href: '/panel/exportaciones',label: 'Exportaciones',icon: Download,        roles: ['superadmin', 'admin', 'atencion'] },
];

interface SidebarProps {
  role: UserRole;
  open: boolean;
  onClose: () => void;
  pendingCount?: number;
}

export function Sidebar({ role, open, onClose, pendingCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const items = NAV.filter(i => i.roles.includes(role));

  return (
    <>
      {/* Overlay móvil */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-primary-900 z-40 flex flex-col transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-primary-800">
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Baja Wastewater</p>
            <p className="text-primary-300 text-xs">Panel interno</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-primary-300 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {items.map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-200 hover:bg-primary-800 hover:text-white',
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.href === '/panel/solicitudes' && pendingCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Badge de rol */}
        <div className="px-5 py-4 border-t border-primary-800">
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded',
            role === 'superadmin' ? 'bg-purple-700 text-purple-100' :
            role === 'admin'      ? 'bg-accent-700 text-accent-100' :
                                    'bg-primary-700 text-primary-200',
          )}>
            {role === 'superadmin' ? 'Superadmin' :
             role === 'admin'      ? 'Administrador' : 'Atención a cliente'}
          </span>
        </div>
      </aside>
    </>
  );
}
