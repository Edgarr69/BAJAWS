'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { UserPlus, UserX, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getSolicitudes, procesarSolicitud } from '@/lib/api';
import { usePanelContext } from '../panel-context';

interface PendingUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export default function SolicitudesPage() {
  const { refreshPending } = usePanelContext();
  const [users, setUsers]     = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{ user: PendingUser; action: 'aprobar' | 'rechazar' } | null>(null);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    getSolicitudes()
      .then(data => setUsers(data))
      .catch(() => toast.error('Error cargando solicitudes'))
      .finally(() => setLoading(false));
  }, []);

  async function handleConfirm() {
    if (!confirm) return;
    setSaving(true);
    try {
      await procesarSolicitud(confirm.user.id, confirm.action);
      setUsers(prev => {
        const next = prev.filter(u => u.id !== confirm.user.id);
        refreshPending();
        return next;
      });
      toast.success(
        confirm.action === 'aprobar'
          ? `Acceso aprobado para ${confirm.user.email}`
          : `Solicitud de ${confirm.user.email} rechazada`
      );
      setConfirm(null);
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Error al procesar la solicitud');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Solicitudes de acceso</h1>
        <p className="text-xs text-slate-400 mt-1">
          Usuarios que iniciaron sesión con Google y están esperando aprobación.
        </p>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Pendientes de aprobación
            {!loading && users.length > 0 && (
              <span className="ml-1 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {users.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserPlus className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm text-slate-400">No hay solicitudes pendientes</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-700 text-xs font-semibold">
                        {(u.full_name ?? u.email)[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{u.full_name ?? u.email}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Solicitó: {new Date(u.created_at).toLocaleDateString('es-MX', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      className="bg-accent-600 hover:bg-accent-500 text-white text-xs h-8 gap-1.5"
                      onClick={() => setConfirm({ user: u, action: 'aprobar' })}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-8 gap-1.5"
                      onClick={() => setConfirm({ user: u, action: 'rechazar' })}
                    >
                      <UserX className="w-3.5 h-3.5" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación */}
      <Dialog open={!!confirm} onOpenChange={open => !open && setConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {confirm?.action === 'aprobar' ? 'Aprobar acceso' : 'Rechazar solicitud'}
            </DialogTitle>
          </DialogHeader>
          {confirm && (
            <p className="text-sm text-slate-600 py-2">
              {confirm.action === 'aprobar' ? (
                <>¿Dar acceso a <strong>{confirm.user.email}</strong>? Entrará como <strong>Atención a cliente</strong>. Puedes cambiar su rol después.</>
              ) : (
                <>¿Rechazar la solicitud de <strong>{confirm.user.email}</strong>? Su cuenta será eliminada.</>
              )}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancelar</Button>
            <Button
              onClick={handleConfirm}
              disabled={saving}
              className={confirm?.action === 'aprobar'
                ? 'bg-accent-600 hover:bg-accent-500 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white'}
            >
              {saving ? 'Procesando…' : confirm?.action === 'aprobar' ? 'Aprobar' : 'Rechazar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
