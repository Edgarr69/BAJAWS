'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Shield, ShieldCheck, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getUsers, setUserRole, getMe } from '@/lib/api';
import type { Profile, UserRole } from '@/types/panel';

const ROLE_LABEL: Record<UserRole, string> = {
  superadmin: 'Superadmin',
  admin:      'Administrador',
  atencion:   'Atención a cliente',
  pending:    'Pendiente',
};

const ROLE_STYLE: Record<UserRole, string> = {
  superadmin: 'bg-purple-100 text-purple-800 border-purple-200',
  admin:      'bg-primary-100 text-primary-800 border-primary-200',
  atencion:   'bg-slate-100 text-slate-600 border-slate-200',
  pending:    'bg-amber-100 text-amber-700 border-amber-200',
};

const ROLE_ICON: Record<UserRole, React.ElementType> = {
  superadmin: ShieldCheck,
  admin:      Shield,
  atencion:   User,
  pending:    User,
};

export default function UsuariosPage() {
  const [users, setUsers]     = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId]       = useState('');
  const [myRole, setMyRole]   = useState<UserRole>('atencion');
  const [confirm, setConfirm] = useState<{ user: Profile; role: 'admin' | 'atencion' } | null>(null);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    Promise.all([getMe(), getUsers()])
      .then(([me, us]) => {
        const profile = me as Profile;
        setMyId(profile.id);
        setMyRole(profile.role);
        setUsers(us as Profile[]);
      })
      .catch(() => toast.error('Error cargando usuarios'))
      .finally(() => setLoading(false));
  }, []);

  async function confirmChange() {
    if (!confirm) return;
    setSaving(true);
    try {
      await setUserRole(confirm.user.id, confirm.role);
      setUsers(us => us.map(u => u.id === confirm.user.id ? { ...u, role: confirm.role } : u));
      setConfirm(null);
      toast.success(`Rol actualizado a "${ROLE_LABEL[confirm.role]}"`);
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Error al cambiar rol');
    } finally {
      setSaving(false);
    }
  }

  // Determina qué botones mostrar para un usuario dado el rol del que está logueado
  function getActions(target: Profile): { label: string; role: 'admin' | 'atencion' }[] {
    if (target.id === myId) return [];               // nunca tocarse a sí mismo
    if (target.role === 'superadmin') return [];     // nadie toca al superadmin

    if (myRole === 'superadmin') {
      // Superadmin puede subir/bajar entre admin y atencion
      return target.role === 'admin'
        ? [{ label: '↓ Bajar a Atención', role: 'atencion' }]
        : [{ label: '↑ Subir a Admin',    role: 'admin'    }];
    }

    if (myRole === 'admin') {
      // Admin solo puede bajar a atencion usuarios que son admin
      // (y no puede subir a nadie a admin)
      return target.role === 'admin'
        ? [{ label: '↓ Bajar a Atención', role: 'atencion' }]
        : [];
    }

    return [];
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Usuarios internos</h1>
        <p className="text-xs text-slate-400 mt-1">
          {myRole === 'superadmin'
            ? 'Como superadmin puedes promover o degradar cualquier usuario.'
            : 'Como admin puedes degradar administradores a atención a cliente.'}
        </p>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : users.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">Sin usuarios registrados</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {users.map(u => {
                const Icon    = ROLE_ICON[u.role];
                const actions = getActions(u);
                return (
                  <div key={u.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        u.role === 'superadmin' ? 'bg-purple-100' :
                        u.role === 'admin'      ? 'bg-primary-100' : 'bg-slate-100'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          u.role === 'superadmin' ? 'text-purple-700' :
                          u.role === 'admin'      ? 'text-primary-700' : 'text-slate-500'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {u.full_name ?? u.email}
                          {u.id === myId && <span className="ml-2 text-xs text-slate-400">(tú)</span>}
                        </p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded border ${ROLE_STYLE[u.role]}`}>
                        {ROLE_LABEL[u.role]}
                      </span>
                      {actions.map(action => (
                        <Button
                          key={action.role}
                          size="sm"
                          variant="outline"
                          className="text-xs h-8"
                          onClick={() => setConfirm({ user: u, role: action.role })}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm dialog */}
      <Dialog open={!!confirm} onOpenChange={open => !open && setConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cambiar rol de usuario</DialogTitle>
          </DialogHeader>
          {confirm && (
            <p className="text-sm text-slate-600 py-2">
              ¿Cambiar el rol de{' '}
              <strong>{confirm.user.full_name ?? confirm.user.email}</strong> a{' '}
              <strong>{ROLE_LABEL[confirm.role]}</strong>?
              Esta acción se aplica de inmediato.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancelar</Button>
            <Button onClick={confirmChange} disabled={saving} className="bg-primary-700 hover:bg-primary-600">
              {saving ? 'Guardando…' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
