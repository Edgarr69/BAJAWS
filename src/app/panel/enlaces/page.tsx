'use client';

import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, RefreshCw, QrCode, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createService, createLink, getLinks, getMe, resetAllData, deleteLinkByCode } from '@/lib/api';
import { getLinkStatus, type FeedbackLink } from '@/types/panel';

const BASE_URL = 'https://bajaws.com.mx/formulario/';

const statusColor: Record<string, string> = {
  vigente:  'bg-accent-100 text-accent-700 border-accent-200',
  usado:    'bg-slate-100 text-slate-600 border-slate-200',
  expirado: 'bg-amber-100 text-amber-700 border-amber-200',
  bloqueado:'bg-red-100 text-red-700 border-red-200',
};

export default function EnlacesPage() {
  const [links, setLinks]       = useState<FeedbackLink[]>([]);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);
  const [role, setRole]         = useState<string>('atencion');

  // form
  const [folio, setFolio]     = useState('');
  const [fecha, setFecha]     = useState('');
  const [ttl, setTtl]         = useState('3600');

  // resultado
  const [newLink, setNewLink] = useState<{ code: string; url: string; expires_at: string } | null>(null);
  const [qrOpen, setQrOpen]   = useState(false);

  // eliminar
  const [confirmReset, setConfirmReset]     = useState(false);
  const [resetting, setResetting]           = useState(false);
  const [deleteCode, setDeleteCode]         = useState('');
  const [deletingCode, setDeletingCode]     = useState(false);

  useEffect(() => {
    Promise.all([getMe(), getLinks()])
      .then(([me, lnks]) => {
        setRole((me as { role: string }).role);
        setLinks(lnks as FeedbackLink[]);
      })
      .catch(() => toast.error('Error cargando datos'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    setCreating(true);
    try {
      let service_id: string | undefined;
      if (folio || fecha) {
        const svc = await createService({ folio: folio || undefined, service_date: fecha || undefined });
        service_id = svc.service.id;
      }
      const ttlSeconds = role === 'admin' ? Number(ttl) : 3600;
      const result = await createLink({ service_id, ttl_seconds: ttlSeconds });
      setNewLink(result);
      toast.success('Enlace generado');
      // recargar lista
      const updated = await getLinks();
      setLinks(updated as FeedbackLink[]);
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Error al generar enlace');
    } finally {
      setCreating(false);
    }
  }

  function copyLink(code: string) {
    navigator.clipboard.writeText(BASE_URL + code);
    toast.success('Enlace copiado');
  }

  async function handleResetAll() {
    setResetting(true);
    try {
      await resetAllData();
      setLinks([]);
      setNewLink(null);
      setConfirmReset(false);
      toast.success('Todos los datos han sido eliminados');
    } catch { toast.error('Error al eliminar datos'); }
    finally { setResetting(false); }
  }

  async function handleDeleteByCode() {
    const code = deleteCode.trim().toUpperCase();
    if (!code) return;
    setDeletingCode(true);
    try {
      await deleteLinkByCode(code);
      setLinks(ls => ls.filter(l => l.code !== code));
      if (newLink?.code === code) setNewLink(null);
      setDeleteCode('');
      toast.success(`Enlace ${code} eliminado`);
    } catch { toast.error('Código no encontrado o error al eliminar'); }
    finally { setDeletingCode(false); }
  }

  function shareWhatsApp(code: string) {
    const text = encodeURIComponent(
      `Hola, te compartimos el formulario de evaluación de Baja Wastewater Solution:\n${BASE_URL}${code}\nTe tomará menos de 1 minuto. ¡Gracias!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-xl font-bold text-slate-800">Generar enlace de evaluación</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Datos del servicio (opcional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="folio" className="text-xs">Folio / referencia</Label>
              <Input id="folio" placeholder="ej. BWS-2025-001" value={folio} onChange={e => setFolio(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fecha" className="text-xs">Fecha del servicio</Label>
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                min={(() => { const d = new Date(); d.setDate(d.getDate() - 3); return d.toISOString().split('T')[0]; })()}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {role === 'admin' && (
              <div className="space-y-1.5">
                <Label className="text-xs">Tiempo de expiración</Label>
                <Select value={ttl} onValueChange={setTtl}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="900">15 minutos</SelectItem>
                    <SelectItem value="3600">1 hora</SelectItem>
                    <SelectItem value="7200">2 horas</SelectItem>
                    <SelectItem value="86400">24 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={handleCreate}
              disabled={creating}
              className="w-full bg-primary-700 hover:bg-primary-600"
            >
              {creating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Generando…
                </span>
              ) : 'Generar enlace'}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado + Acciones de eliminación */}
        <Card className={`border-2 transition-colors flex flex-col ${newLink ? 'border-accent-400' : 'border-slate-200'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Enlace generado</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 gap-0 p-0">
            {/* Resultado */}
            <div className="px-6 pb-5">
              {!newLink ? (
                <div className="h-32 flex items-center justify-center text-slate-300 text-sm">
                  El enlace aparecerá aquí
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-lg p-3 break-all text-sm font-mono text-primary-700 border border-slate-200">
                    {BASE_URL}{newLink.code}
                  </div>
                  <p className="text-xs text-slate-400">
                    Expira: {new Date(newLink.expires_at).toLocaleString('es-MX')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => copyLink(newLink.code)}>
                      <Copy className="w-3.5 h-3.5" /> Copiar
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 text-green-700 border-green-300 hover:bg-green-50" onClick={() => shareWhatsApp(newLink.code)}>
                      <Share2 className="w-3.5 h-3.5" /> WhatsApp
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setQrOpen(true)}>
                      <QrCode className="w-3.5 h-3.5" /> QR
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Zona de eliminación — solo admin/superadmin */}
            {(role === 'admin' || role === 'superadmin') && (
              <div className="border-t border-slate-100 px-6 py-4 mt-auto space-y-3">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Eliminar un enlace</p>
                {/* Por código */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Código (ej. AB12CD34)"
                    value={deleteCode}
                    onChange={e => setDeleteCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    className="font-mono text-sm h-8 text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-xs gap-1.5 text-red-600 border-red-200 hover:bg-red-50 shrink-0"
                    onClick={handleDeleteByCode}
                    disabled={deletingCode || deleteCode.trim().length === 0}
                  >
                    {deletingCode
                      ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                      : <Trash2 className="w-3 h-3" />
                    }
                    Eliminar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabla de enlaces */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-700">Historial de enlaces</CardTitle>
            {(role === 'admin' || role === 'superadmin') && links.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 gap-1.5"
                onClick={() => setConfirmReset(true)}
              >
                <Trash2 className="w-3.5 h-3.5" /> Eliminar todo
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : links.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">Sin enlaces generados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Folio</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Generado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Expira</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map(link => {
                    const status = getLinkStatus(link);
                    return (
                      <tr key={link.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-primary-700">{link.code}</td>
                        <td className="px-4 py-3 text-slate-600">{link.services?.folio ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{new Date(link.created_at).toLocaleDateString('es-MX')}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{new Date(link.expires_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusColor[status]}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {status !== 'usado' && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => copyLink(link.code)}>
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-green-600" onClick={() => shareWhatsApp(link.code)}>
                                <Share2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog confirmar eliminar todo */}
      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">¿Eliminar todos los datos?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 py-1">
            Esto eliminará <strong>todos los enlaces, respuestas y servicios</strong> registrados. No habrá información para mostrar en el dashboard ni en los reportes. Esta acción no se puede deshacer.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmReset(false)} disabled={resetting}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleResetAll}
              disabled={resetting}
              className="gap-2"
            >
              {resetting && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              Sí, eliminar todo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog QR */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-xs text-center">
          <DialogHeader>
            <DialogTitle>Código QR</DialogTitle>
          </DialogHeader>
          {newLink && (
            <div className="flex flex-col items-center gap-4 py-4">
              <QRCodeSVG value={BASE_URL + newLink.code} size={200} level="M" />
              <p className="text-xs text-slate-500 font-mono">{newLink.code}</p>
              <Button size="sm" variant="outline" onClick={() => copyLink(newLink.code)}>
                Copiar enlace
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
