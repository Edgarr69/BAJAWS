'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Shield, ShieldCheck, User, Trash2, Pencil, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUsers, setUserRole, updateUserName, createUser, deleteUser, getMe } from '@/lib/api';
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
  const [confirm, setConfirm]         = useState<{ user: Profile; role: 'admin' | 'atencion' } | null>(null);
  const [confirmDel, setConfirmDel]   = useState<Profile | null>(null);
  const [editName, setEditName]       = useState<{ user: Profile; name: string } | null>(null);
  const [newUser, setNewUser]         = useState<{ email: string; password: string; full_name: string; role: 'admin' | 'atencion' | 'pending' } | null>(null);
  const [saving, setSaving]           = useState(false);

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

  async function confirmEditName() {
    if (!editName) return;
    setSaving(true);
    try {
      await updateUserName(editName.user.id, editName.name.trim());
      setUsers(us => us.map(u => u.id === editName.user.id ? { ...u, full_name: editName.name.trim() || null } : u));
      setEditName(null);
      toast.success('Nombre actualizado');
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Error al actualizar nombre');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateUser() {
    if (!newUser) return;
    setSaving(true);
    try {
      await createUser(newUser);
      const us = await getUsers();
      setUsers(us as Profile[]);
      setNewUser(null);
      toast.success('Usuario creado');
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Error al crear usuario');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!confirmDel) return;
    setSaving(true);
    try {
      await deleteUser(confirmDel.id);
      setUsers(us => us.filter(u => u.id !== confirmDel.id));
      setConfirmDel(null);
      toast.success('Usuario eliminado');
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Error al eliminar usuario');
    } finally {
      setSaving(false);
    }
  }

  function getActions(target: Profile): { label: string; role: 'admin' | 'atencion' }[] {
    if (target.id === myId) return [];
    if (target.role === 'superadmin') return [];

    if (myRole === 'superadmin') {
      return target.role === 'admin'
        ? [{ label: '↓ Bajar a Atención', role: 'atencion' }]
        : [{ label: '↑ Subir a Admin',    role: 'admin'    }];
    }

    if (myRole === 'admin') {
      return target.role === 'admin'
        ? [{ label: '↓ Bajar a Atención', role: 'atencion' }]
        : [];
    }

    return [];
  }

  const canEditName = myRole === 'superadmin' || myRole === 'admin';

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Usuarios internos</h1>
          <p className="text-xs text-slate-400 mt-1">
            {myRole === 'superadmin'
              ? 'Como superadmin puedes promover o degradar cualquier usuario.'
              : 'Como admin puedes degradar administradores a atención a cliente.'}
          </p>
        </div>
        {canEditName && (
          <Button
            size="sm"
            className="bg-primary-700 hover:bg-primary-600 shrink-0"
            onClick={() => setNewUser({ email: '', password: '', full_name: '', role: 'atencion' })}
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Nuevo usuario
          </Button>
        )}
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
                        {u.full_name && (
                          <p className="text-sm font-medium text-slate-800">
                            {u.full_name}
                            {u.id === myId && <span className="ml-2 text-xs text-slate-400">(tú)</span>}
                          </p>
                        )}
                        <p className={u.full_name ? 'text-xs text-slate-400' : 'text-sm font-medium text-slate-800'}>
                          {u.email}
                          {!u.full_name && u.id === myId && <span className="ml-2 text-xs text-slate-400">(tú)</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded border ${ROLE_STYLE[u.role]}`}>
                        {ROLE_LABEL[u.role]}
                      </span>
                      {canEditName && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 text-slate-500"
                          onClick={() => setEditName({ user: u, name: u.full_name ?? '' })}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      )}
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
                      {myRole === 'superadmin' && u.id !== myId && u.role !== 'superadmin' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                          onClick={() => setConfirmDel(u)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog nuevo usuario */}
      <Dialog open={!!newUser} onOpenChange={open => !open && setNewUser(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
          </DialogHeader>
          {newUser && (
            <div className="py-2 space-y-3">
              <input
                type="email"
                placeholder="Correo electrónico *"
                value={newUser.email}
                onChange={e => setNewUser(p => p && ({ ...p, email: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 placeholder:text-slate-300"
                autoFocus
              />
              <input
                type="password"
                placeholder="Contraseña * (mín. 6 caracteres)"
                value={newUser.password}
                onChange={e => setNewUser(p => p && ({ ...p, password: e.target.value }))}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 placeholder:text-slate-300"
              />
              <input
                type="text"
                placeholder="Nombre completo (opcional)"
                value={newUser.full_name}
                onChange={e => setNewUser(p => p && ({ ...p, full_name: e.target.value }))}
                maxLength={80}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 placeholder:text-slate-300"
              />
              <Select
                value={newUser.role}
                onValueChange={v => setNewUser(p => p && ({ ...p, role: v as 'admin' | 'atencion' | 'pending' }))}
              >
                <SelectTrigger className="text-sm h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {myRole === 'superadmin' && <SelectItem value="admin">Administrador</SelectItem>}
                  <SelectItem value="atencion">Atención a cliente</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewUser(null)}>Cancelar</Button>
            <Button
              onClick={handleCreateUser}
              disabled={saving || !newUser?.email || !newUser?.password}
              className="bg-primary-700 hover:bg-primary-600"
            >
              {saving ? 'Creando…' : 'Crear usuario'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog editar nombre */}
      <Dialog open={!!editName} onOpenChange={open => !open && setEditName(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar nombre</DialogTitle>
          </DialogHeader>
          {editName && (
            <div className="py-2 space-y-2">
              <p className="text-xs text-slate-400">{editName.user.email}</p>
              <input
                type="text"
                placeholder="Nombre completo"
                value={editName.name}
                onChange={e => setEditName(prev => prev ? { ...prev, name: e.target.value } : null)}
                maxLength={80}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 placeholder:text-slate-300"
                autoFocus
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditName(null)}>Cancelar</Button>
            <Button onClick={confirmEditName} disabled={saving} className="bg-primary-700 hover:bg-primary-600">
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog cambiar rol */}
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

      {/* Dialog eliminar usuario */}
      <Dialog open={!!confirmDel} onOpenChange={open => !open && setConfirmDel(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar usuario</DialogTitle>
          </DialogHeader>
          {confirmDel && (
            <p className="text-sm text-slate-600 py-2">
              ¿Eliminar a <strong>{confirmDel.full_name ?? confirmDel.email}</strong>?
              Esta acción es <strong>permanente</strong> e irreversible.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDel(null)}>Cancelar</Button>
            <Button onClick={confirmDelete} disabled={saving} className="bg-red-600 hover:bg-red-500 text-white">
              {saving ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
