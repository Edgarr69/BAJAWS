'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Bell, Plus, Trash2, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  createNotificationEmail,
  toggleNotificationEmail,
  deleteNotificationEmail,
  type NotificationEmail,
} from '@/lib/api';

export function NotificacionesClient({ initialItems }: { initialItems: NotificationEmail[] }) {
  const [items, setItems]           = useState<NotificationEmail[]>(initialItems);
  const [toggling, setToggling]     = useState<string | null>(null);
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<NotificationEmail | null>(null);
  const [showAdd, setShowAdd]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [attempted, setAttempted]   = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail]     = useState('');
  const [newLabel, setNewLabel]     = useState('');
  const [isExternal, setIsExternal] = useState(false);

  const resolvedEmail = isExternal ? newEmail.trim() : `${newUsername.trim()}@bajaws.com.mx`;
  const emailValid    = isExternal ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim()) : newUsername.trim().length > 0;
  const labelValid    = newLabel.trim().length > 0;

  async function handleToggle(item: NotificationEmail) {
    setToggling(item.id);
    try {
      const updated = await toggleNotificationEmail(item.id, !item.is_active);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: updated.is_active } : i));
      toast.success(updated.is_active ? 'Correo activado' : 'Correo desactivado');
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Error al actualizar estado');
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete() {
    if (!confirmDel) return;
    setDeleting(confirmDel.id);
    try {
      await deleteNotificationEmail(confirmDel.id);
      setItems(prev => prev.filter(i => i.id !== confirmDel.id));
      setConfirmDel(null);
      toast.success('Correo eliminado');
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Error al eliminar');
    } finally {
      setDeleting(null);
    }
  }

  async function handleAdd() {
    setAttempted(true);
    if (!emailValid || !labelValid) return;
    setSaving(true);
    try {
      const created = await createNotificationEmail({
        email: resolvedEmail,
        label: newLabel.trim() || undefined,
      });
      setItems(prev => [...prev, created]);
      setShowAdd(false);
      setNewUsername('');
      setNewEmail('');
      setNewLabel('');
      setAttempted(false);
      setIsExternal(false);
      toast.success('Correo agregado');
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Error al agregar correo');
    } finally {
      setSaving(false);
    }
  }

  function handleCloseAdd() {
    if (saving) return;
    setShowAdd(false);
    setNewUsername('');
    setNewEmail('');
    setNewLabel('');
    setAttempted(false);
    setIsExternal(false);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Correos de notificación</h1>
          <p className="text-xs text-slate-400 mt-1">
            Direcciones que reciben avisos cuando llega un nuevo mensaje de contacto o cotización.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-primary-700 hover:bg-primary-600 shrink-0"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Agregar correo
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary-600" />
            Destinatarios registrados
            {items.length > 0 && (
              <span className="ml-1 bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm text-slate-400">No hay correos de notificación registrados</p>
              <p className="text-xs text-slate-300 mt-1">
                Agrega al menos un correo para recibir avisos de nuevos mensajes.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-medium text-slate-800 truncate">
                        {item.email}
                      </span>
                      {item.label && (
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                          {item.label}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-300">
                      Agregado el{' '}
                      {new Date(item.created_at).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={
                        item.is_active
                          ? 'text-accent-700 border-accent-300 bg-accent-50 text-[10px] px-2 py-0.5'
                          : 'text-slate-500 border-slate-200 bg-slate-50 text-[10px] px-2 py-0.5'
                      }
                    >
                      {item.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs text-slate-600 border-slate-200"
                      disabled={toggling === item.id}
                      onClick={() => handleToggle(item)}
                    >
                      {toggling === item.id
                        ? 'Actualizando…'
                        : item.is_active
                        ? 'Desactivar'
                        : 'Activar'}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-red-500 border-red-200 hover:bg-red-50"
                      disabled={deleting === item.id}
                      onClick={() => setConfirmDel(item)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog agregar correo */}
      <Dialog open={showAdd} onOpenChange={open => !open && handleCloseAdd()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Agregar correo de notificación</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {!isExternal ? (
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500">
                <input
                  type="text"
                  placeholder="usuario"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value.replace(/[@\s]/g, ''))}
                  maxLength={64}
                  autoFocus
                  className="flex-1 text-base md:text-sm px-4 py-3 focus:outline-none text-slate-700 placeholder:text-slate-300"
                />
                <span className="px-4 py-3 bg-slate-50 text-slate-500 text-sm border-l border-slate-200 select-none whitespace-nowrap">
                  @bajaws.com.mx
                </span>
              </div>
            ) : (
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                maxLength={254}
                autoFocus
                className="w-full text-base md:text-sm border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 placeholder:text-slate-300"
              />
            )}

            <button
              type="button"
              onClick={() => { setIsExternal(v => !v); setNewUsername(''); setNewEmail(''); }}
              className="text-xs text-secondary-500 hover:underline"
            >
              {isExternal ? 'Usar correo @bajaws.com.mx' : 'No es correo de la empresa'}
            </button>

            <div className="space-y-1">
              <input
                type="text"
                placeholder="Etiqueta descriptiva (ej. Ventas, Gerencia)"
                value={newLabel}
                onChange={e => {
                  const v = e.target.value;
                  setNewLabel(v.length > 0 ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : '');
                }}
                maxLength={60}
                className={`w-full text-base md:text-sm border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 text-slate-700 placeholder:text-slate-300 ${
                  attempted && !labelValid
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-slate-200 focus:ring-primary-500'
                }`}
              />
              {attempted && !labelValid && (
                <p className="text-xs text-red-500 pl-1">La etiqueta es requerida</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseAdd} disabled={saving}>
              Cancelar
            </Button>
            <Button
              onClick={handleAdd}
              disabled={saving || (attempted && (!emailValid || !labelValid))}
              className="bg-primary-700 hover:bg-primary-600"
            >
              {saving ? 'Guardando…' : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmar eliminación */}
      <Dialog open={!!confirmDel} onOpenChange={open => !open && setConfirmDel(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar correo de notificación</DialogTitle>
          </DialogHeader>
          {confirmDel && (
            <p className="text-sm text-slate-600 py-2">
              ¿Eliminar <strong>{confirmDel.email}</strong>
              {confirmDel.label ? ` (${confirmDel.label})` : ''}?
              Esta acción es <strong>permanente</strong>.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDel(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={!!deleting}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
