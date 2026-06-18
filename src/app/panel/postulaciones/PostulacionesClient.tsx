'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Users, Mail, Phone, Trash2, Eye, FileText, Briefcase, ExternalLink, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { deleteJobApplication, getJobApplicationCvUrl } from '@/lib/api';
import { usePanelUser } from '../user-context';
import type { JobApplication } from '@/types/panel';

export function PostulacionesClient({ initialItems }: { initialItems: JobApplication[] }) {
  const { role } = usePanelUser();
  const canDelete = role === 'superadmin' || role === 'admin';

  const [items, setItems]           = useState<JobApplication[]>(initialItems);
  const [detail, setDetail]         = useState<JobApplication | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting]     = useState(false);
  const [cvPreview, setCvPreview]   = useState<{ id: string; nombre: string; url: string | null } | null>(null);
  const cvCacheRef = useRef<Map<string, string>>(new Map());

  // Grupos colapsables por vacante
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  function toggleCollapse(key: string) {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  // Agrupar por vacante preservando orden de aparición
  const groups: { key: string; titulo: string; apps: JobApplication[] }[] = [];
  const seen = new Map<string, number>();
  for (const item of items) {
    const key   = item.posting_id ?? '__sin__';
    const titulo = item.job_postings?.titulo ?? 'Sin vacante asignada';
    if (!seen.has(key)) {
      seen.set(key, groups.length);
      groups.push({ key, titulo, apps: [] });
    }
    groups[seen.get(key)!].apps.push(item);
  }

  async function handleDelete() {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await deleteJobApplication(confirmDeleteId);
      setItems(prev => prev.filter(i => i.id !== confirmDeleteId));
      setConfirmDeleteId(null);
      setDetail(null);
      toast.success('Postulación eliminada');
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setDeleting(false);
    }
  }

  function handleViewCv(id: string, nombre: string) {
    const cached = cvCacheRef.current.get(id);
    setCvPreview({ id, nombre, url: cached ?? null });
    if (!cached) void loadCv(id);
  }

  async function loadCv(id: string) {
    try {
      const { url } = await getJobApplicationCvUrl(id);
      const res = await fetch(url);
      if (!res.ok) throw new Error('CV_FETCH_FAILED');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      cvCacheRef.current.set(id, blobUrl);
      setCvPreview(prev => (prev && prev.id === id ? { ...prev, url: blobUrl } : prev));
    } catch {
      toast.error('No se pudo cargar el CV');
      setCvPreview(prev => (prev && prev.id === id && !prev.url ? null : prev));
    }
  }

  function handleCloseCv() {
    setCvPreview(null);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Postulaciones</h1>
          <p className="text-xs text-slate-400 mt-1">
            Candidatos que aplicaron a las vacantes publicadas.
          </p>
        </div>
        {items.length > 0 && (
          <span className="text-xs text-slate-400 mt-1">
            {items.length} postulación{items.length !== 1 ? 'es' : ''} en total
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="py-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-400">No hay postulaciones todavía</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map(group => {
            const isCollapsed = collapsed.has(group.key);
            return (
              <Card key={group.key} className="border-slate-200 overflow-hidden">
                <CardHeader className="pb-0 pt-0 px-0">
                  <button
                    onClick={() => toggleCollapse(group.key)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary-600 shrink-0" />
                      <span className="truncate">{group.titulo}</span>
                      <span className="ml-1 bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                        {group.apps.length}
                      </span>
                    </CardTitle>
                    {isCollapsed
                      ? <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      : <ChevronDown  className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>
                </CardHeader>

                {!isCollapsed && (
                  <CardContent className="p-0">
                    <div className="border-t border-slate-100 divide-y divide-slate-100">
                      {group.apps.map(item => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between px-5 py-4 hover:bg-slate-50 transition-colors gap-4"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-sm font-semibold text-slate-800 truncate">
                                {item.nombre}
                              </span>
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
                              title="Ver detalle"
                              className="h-8 w-8 p-0 text-slate-500 border-slate-200"
                              onClick={() => setDetail(item)}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            {canDelete && (
                              <Button
                                size="sm"
                                variant="outline"
                                title="Eliminar postulación"
                                className="h-8 w-8 p-0 text-red-500 border-red-200 hover:bg-red-50"
                                onClick={() => setConfirmDeleteId(item.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de detalle */}
      <Dialog open={!!detail} onOpenChange={open => { if (!open && !cvPreview && !confirmDeleteId) setDetail(null); }}>
        <DialogContent
          className="sm:max-w-lg"
          onInteractOutside={e => { if (cvPreview || confirmDeleteId) e.preventDefault(); }}
          onEscapeKeyDown={e => { if (cvPreview || confirmDeleteId) e.preventDefault(); }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              {detail?.nombre}
              {detail?.job_postings?.titulo && (
                <Badge variant="outline" className="text-primary-700 border-primary-200 bg-primary-50 text-[10px]">
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
                    onClick={() => handleViewCv(detail.id, detail.nombre)}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Ver CV (PDF)
                  </Button>
                ) : (
                  <span className="text-xs text-slate-400">Sin CV adjunto</span>
                )}
                {canDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                    onClick={() => setConfirmDeleteId(detail.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog confirmar eliminar */}
      <Dialog open={!!confirmDeleteId} onOpenChange={open => !open && !deleting && setConfirmDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Eliminar postulación
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 py-2">
            Se eliminará la postulación junto con su CV adjunto. Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-500 text-white">
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal vista previa del CV */}
      <Dialog open={!!cvPreview} onOpenChange={open => { if (!open) handleCloseCv(); }}>
        <DialogContent
          className="max-w-4xl p-0 overflow-hidden gap-0"
          style={{ height: '85vh', display: 'grid', gridTemplateRows: 'auto 1fr' }}
          onEscapeKeyDown={e => { e.stopPropagation(); handleCloseCv(); }}
          onOpenAutoFocus={e => e.preventDefault()}
        >
          <DialogHeader className="px-4 py-3 border-b border-slate-100 flex-row items-center justify-between space-y-0">
            <DialogTitle className="flex items-center gap-2 text-sm font-medium text-slate-700 min-w-0 pr-8">
              <FileText className="w-4 h-4 text-primary-600 shrink-0" />
              <span className="truncate">CV — {cvPreview?.nombre}</span>
            </DialogTitle>
            <button
              type="button"
              disabled={!cvPreview?.url}
              onClick={() => cvPreview?.url && window.open(cvPreview.url, '_blank', 'noopener,noreferrer')}
              className="text-slate-400 hover:text-primary-600 transition-colors p-1 shrink-0 mr-6 disabled:opacity-40 disabled:pointer-events-none"
              title="Abrir en pestaña nueva"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </DialogHeader>
          {cvPreview && (cvPreview.url ? (
            <embed src={cvPreview.url} type="application/pdf" className="w-full h-full block" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <span className="w-8 h-8 border-[3px] border-primary-100 border-t-primary-600 rounded-full motion-safe:animate-spin" />
              <span className="text-xs">Cargando CV…</span>
            </div>
          ))}
        </DialogContent>
      </Dialog>
    </div>
  );
}
