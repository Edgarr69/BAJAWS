'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Users, Mail, Phone, Trash2, Eye, FileText, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { deleteJobApplication, getJobApplicationCvUrl } from '@/lib/api';
import { usePanelUser } from '../user-context';
import type { JobApplication } from '@/types/panel';

export function PostulacionesClient({ initialItems }: { initialItems: JobApplication[] }) {
  const { role } = usePanelUser();
  const canDelete = role === 'superadmin' || role === 'admin';

  const [items, setItems]           = useState<JobApplication[]>(initialItems);
  const [detail, setDetail]         = useState<JobApplication | null>(null);
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [loadingCv, setLoadingCv]   = useState<string | null>(null);

  const vacantes = Array.from(
    new Set(items.map(i => i.job_postings?.titulo ?? 'Sin vacante'))
  );
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all'
    ? items
    : items.filter(i => (i.job_postings?.titulo ?? 'Sin vacante') === filter);

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteJobApplication(id);
      setItems(prev => prev.filter(i => i.id !== id));
      setDetail(null);
      toast.success('Postulación eliminada');
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setDeleting(null);
    }
  }

  async function handleViewCv(id: string) {
    setLoadingCv(id);
    try {
      const { url } = await getJobApplicationCvUrl(id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('No se pudo obtener el enlace del CV');
    } finally {
      setLoadingCv(null);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Postulaciones</h1>
        <p className="text-xs text-slate-400 mt-1">
          Candidatos que aplicaron a las vacantes publicadas.
        </p>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-600" />
              {filter === 'all' ? 'Todos los candidatos' : filter}
              {filtered.length > 0 && (
                <span className="ml-1 bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {filtered.length}
                </span>
              )}
            </CardTitle>

            {vacantes.length > 1 && (
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 flex-wrap">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Todos ({items.length})
                </button>
                {vacantes.map(v => (
                  <button
                    key={v}
                    onClick={() => setFilter(v)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all max-w-[180px] truncate ${
                      filter === v
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {v} ({items.filter(i => (i.job_postings?.titulo ?? 'Sin vacante') === v).length})
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm text-slate-400">
                {items.length === 0
                  ? 'No hay postulaciones todavía'
                  : 'No hay postulaciones para esta vacante'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map(item => (
                <div
                  key={item.id}
                  className="flex items-start justify-between px-5 py-4 hover:bg-slate-50 transition-colors gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-slate-800 truncate">
                        {item.nombre}
                      </span>
                      {item.job_postings?.titulo && (
                        <Badge
                          variant="outline"
                          className="text-primary-700 border-primary-200 bg-primary-50 text-[10px] px-1.5 py-0 flex items-center gap-1"
                        >
                          <Briefcase className="w-2.5 h-2.5" />
                          {item.job_postings.titulo}
                        </Badge>
                      )}
                      {item.cv_path && (
                        <Badge
                          variant="outline"
                          className="text-accent-700 border-accent-300 bg-accent-50 text-[10px] px-1.5 py-0 flex items-center gap-1"
                        >
                          <FileText className="w-2.5 h-2.5" />
                          CV
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
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
                    {item.mensaje && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{item.mensaje}</p>
                    )}
                    <p className="text-[10px] text-slate-300 mt-1">
                      {new Date(item.created_at).toLocaleDateString('es-MX', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
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
              {detail?.nombre}
              {detail?.job_postings?.titulo && (
                <Badge
                  variant="outline"
                  className="text-primary-700 border-primary-200 bg-primary-50 text-[10px]"
                >
                  {detail.job_postings.titulo}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 py-1">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Correo</p>
                  <p className="font-medium text-slate-800 break-all">{detail.correo}</p>
                </div>
                {detail.telefono && (
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Teléfono</p>
                    <p className="font-medium text-slate-800">{detail.telefono}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-xs text-slate-400 mb-0.5">Fecha de postulación</p>
                  <p className="text-slate-600 text-xs">
                    {new Date(detail.created_at).toLocaleDateString('es-MX', {
                      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {detail.mensaje && (
                <div>
                  <p className="text-xs text-slate-400 mb-1.5">Mensaje / carta de presentación</p>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 leading-relaxed whitespace-pre-wrap border border-slate-100">
                    {detail.mensaje}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 gap-3 flex-wrap">
                {detail.cv_path ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-primary-700 border-primary-200 hover:bg-primary-50"
                    disabled={loadingCv === detail.id}
                    onClick={() => handleViewCv(detail.id)}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {loadingCv === detail.id ? 'Cargando…' : 'Ver CV (PDF)'}
                  </Button>
                ) : (
                  <span className="text-xs text-slate-400">Sin CV adjunto</span>
                )}
                {canDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                    disabled={deleting === detail.id}
                    onClick={() => handleDelete(detail.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deleting === detail.id ? 'Eliminando…' : 'Eliminar'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
