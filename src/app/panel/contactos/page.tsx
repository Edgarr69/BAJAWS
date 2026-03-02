'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Mail, Phone, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getContactos, deleteContacto, getMe } from '@/lib/api';
import type { ContactRequest } from '@/types/panel';

export default function ContactosPage() {
  const [items, setItems]       = useState<ContactRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [canDelete, setDelete]  = useState(false);
  const [detail, setDetail]     = useState<ContactRequest | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getContactos(),
      getMe(),
    ]).then(([data, me]) => {
      setItems(data as ContactRequest[]);
      setDelete(me.role === 'superadmin' || me.role === 'admin');
    }).catch(() => toast.error('Error cargando mensajes'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteContacto(id);
      setItems(prev => prev.filter(i => i.id !== id));
      setDetail(null);
      toast.success('Mensaje eliminado');
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setDeleting(null);
    }
  }

  const fuenteLabel = (f: string) =>
    f === 'cotizacion' ? 'Cotización' : 'Contacto';

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Mensajes recibidos</h1>
        <p className="text-xs text-slate-400 mt-1">
          Mensajes del formulario de contacto y solicitudes de cotización.
        </p>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary-600" />
            Todos los mensajes
            {!loading && items.length > 0 && (
              <span className="ml-1 bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm text-slate-400">No hay mensajes todavía</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-start justify-between px-5 py-4 hover:bg-slate-50 transition-colors gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-medium text-slate-800 truncate">
                        {item.nombre}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          item.fuente === 'cotizacion'
                            ? 'text-accent-700 border-accent-300 bg-accent-50 text-[10px] px-1.5 py-0'
                            : 'text-primary-700 border-primary-200 bg-primary-50 text-[10px] px-1.5 py-0'
                        }
                      >
                        {fuenteLabel(item.fuente)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {item.correo}
                      </span>
                      {item.telefono && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {item.telefono}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{item.mensaje}</p>
                    <p className="text-[10px] text-slate-300 mt-1">
                      {new Date(item.created_at).toLocaleDateString('es-MX', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-slate-500 border-slate-200"
                      onClick={() => setDetail(item)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    {canDelete && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 text-red-500 border-red-200 hover:bg-red-50"
                        disabled={deleting === item.id}
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalle */}
      <Dialog open={!!detail} onOpenChange={open => !open && setDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Mensaje de {detail?.nombre}
              {detail && (
                <Badge
                  variant="outline"
                  className={
                    detail.fuente === 'cotizacion'
                      ? 'text-accent-700 border-accent-300 bg-accent-50 text-[10px]'
                      : 'text-primary-700 border-primary-200 bg-primary-50 text-[10px]'
                  }
                >
                  {fuenteLabel(detail.fuente)}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 py-1">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Correo</p>
                  <p className="font-medium text-slate-800">{detail.correo}</p>
                </div>
                {detail.telefono && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Teléfono</p>
                    <p className="font-medium text-slate-800">{detail.telefono}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-xs text-slate-400 mb-0.5">Fecha</p>
                  <p className="text-slate-600 text-xs">
                    {new Date(detail.created_at).toLocaleDateString('es-MX', {
                      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1.5">Mensaje</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 leading-relaxed whitespace-pre-wrap border border-slate-100">
                  {detail.mensaje}
                </p>
              </div>
              {canDelete && (
                <div className="flex justify-end pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                    disabled={deleting === detail.id}
                    onClick={() => handleDelete(detail.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deleting === detail.id ? 'Eliminando…' : 'Eliminar mensaje'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
