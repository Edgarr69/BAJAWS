'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, FileDown, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getSubmissions, getSubmission, deleteSubmission, resetAllData } from '@/lib/api';
import { usePanelUser } from '../user-context';
import type { Submission, Answer } from '@/types/panel';

const today = new Date().toISOString().slice(0, 10);

export default function RespuestasPage() {
  const { role: myRole } = usePanelUser();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading]         = useState(true);
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');
  const [search, setSearch]           = useState('');
  const [detail, setDetail]           = useState<{ submission: Submission; answers: Answer[] } | null>(null);
  const [detailOpen, setDetailOpen]   = useState(false);
  const [detailLoading, setDL]        = useState(false);
  const [confirmPurge, setConfirmPurge]       = useState(false);
  const [purging, setPurging]                 = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting]               = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo)   params.date_to   = dateTo;
      const data = await getSubmissions(params);
      setSubmissions(data as Submission[]);
    } catch {
      toast.error('Error cargando respuestas');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getSubmissions()
      .then(data => setSubmissions(data as Submission[]))
      .catch(() => toast.error('Error cargando respuestas'))
      .finally(() => setLoading(false));
  }, []);

  async function openDetail(id: string) {
    setDetailOpen(true);
    setDL(true);
    try {
      const d = await getSubmission(id);
      setDetail(d as { submission: Submission; answers: Answer[] });
    } catch {
      toast.error('Error cargando detalle');
      setDetailOpen(false);
    } finally {
      setDL(false);
    }
  }

  async function handlePurge() {
    setPurging(true);
    try {
      await resetAllData();
      setSubmissions([]);
      setConfirmPurge(false);
      toast.success('Todas las respuestas y enlaces han sido eliminados');
    } catch {
      toast.error('Error al eliminar los datos');
    } finally {
      setPurging(false);
    }
  }

  async function handleDelete() {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await deleteSubmission(confirmDeleteId);
      setSubmissions(prev => prev.filter(s => s.id !== confirmDeleteId));
      setConfirmDeleteId(null);
      toast.success('Respuesta eliminada');
    } catch {
      toast.error('Error al eliminar la respuesta');
    } finally {
      setDeleting(false);
    }
  }

  const scoreColor = (v: number) =>
    v <= 2 ? 'text-red-600 font-bold' : v === 3 ? 'text-amber-600 font-semibold' : 'text-accent-700 font-bold';

  const filtered = search.trim()
    ? submissions.filter(s =>
        s.company_name?.toLowerCase().includes(search.trim().toLowerCase())
      )
    : submissions;

  const canPurge = myRole === 'superadmin' || myRole === 'admin';

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-xl font-bold text-slate-800">Respuestas</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <input type="date" value={dateFrom} max={dateTo || today} onChange={e => setDateFrom(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
        <span className="text-slate-400 text-sm">—</span>
        <input type="date" value={dateTo} min={dateFrom} max={today} onChange={e => setDateTo(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
        <Button size="sm" onClick={load} className="bg-primary-700 hover:bg-primary-600">Filtrar</Button>
        <Button size="sm" variant="outline" onClick={() => { setDateFrom(''); setDateTo(''); }}>Reset</Button>
        <input
          type="text"
          placeholder="Buscar empresa…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[10rem]"
        />
        {search.trim() && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-primary-300 text-primary-700 hover:bg-primary-50"
            onClick={() => {
              const params = new URLSearchParams({ empresa: search.trim() });
              if (dateFrom) params.set('date_from', dateFrom);
              if (dateTo)   params.set('date_to',   dateTo);
              router.push(`/panel/exportaciones?${params.toString()}`);
            }}
          >
            <FileDown className="w-3.5 h-3.5" />
            Generar reporte PDF
          </Button>
        )}
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700">
            {!loading && (
              <span>
                {filtered.length}{' '}
                {filtered.length === 1 ? 'respuesta' : 'respuestas'}
                {search.trim() ? ' encontradas' : ' en total'}
              </span>
            )}
          </CardTitle>
          {canPurge && !loading && submissions.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setConfirmPurge(true)}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar todo
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : submissions.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">Sin respuestas en el periodo</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">Sin resultados para &quot;{search}&quot;</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="max-h-[32.5rem] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Código</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Empresa</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(s => (
                      <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-600 text-xs">
                          {new Date(s.submitted_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-primary-700">
                          {(s.feedback_links as { code: string } | null)?.code ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-700 text-xs">
                          {s.company_name ?? <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openDetail(s.id)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            {canPurge && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-red-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => setConfirmDeleteId(s.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog detalle */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de respuestas</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-3 py-4">{[1,2,3].map(i => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : detail ? (
            <div className="space-y-5">
              <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 space-y-1">
                <p><span className="font-medium">Fecha:</span> {new Date(detail.submission.submitted_at).toLocaleString('es-MX')}</p>
                <p><span className="font-medium">Código:</span> {(detail.submission.feedback_links as { code: string } | null)?.code ?? '—'}</p>
                {detail.submission.company_name && (
                  <p><span className="font-medium">Empresa:</span> {detail.submission.company_name}</p>
                )}
              </div>

              {(() => {
                const grouped: Record<string, Answer[]> = {};
                for (const a of detail.answers) {
                  const topic = a.questions?.topics?.name ?? 'Sin tema';
                  if (!grouped[topic]) grouped[topic] = [];
                  grouped[topic].push(a);
                }
                return Object.entries(grouped).map(([topic, answers]) => (
                  <div key={topic}>
                    <h3 className="text-sm font-semibold text-primary-800 mb-2">{topic}</h3>
                    <div className="space-y-2">
                      {answers.map(a => (
                        <div key={a.id} className="flex items-start justify-between gap-3 py-2 border-b border-slate-100">
                          <p className="text-sm text-slate-700 flex-1">{a.questions?.text}</p>
                          <span className={`text-sm shrink-0 ${scoreColor(a.value_int)}`}>{a.value_int}/5</span>
                        </div>
                      ))}
                    </div>
                    {answers.some(a => a.value_text) && (
                      <div className="mt-2 space-y-1">
                        {answers.filter(a => a.value_text).map(a => (
                          <div key={a.id} className="bg-amber-50 border border-amber-100 rounded p-2 text-xs text-slate-600">
                            <span className="font-medium">Comentario:</span> {a.value_text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Dialog confirmar eliminar individual */}
      <Dialog open={!!confirmDeleteId} onOpenChange={open => !open && !deleting && setConfirmDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Eliminar respuesta
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 py-2">
            Se eliminará esta respuesta junto con todas sus calificaciones. Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmar purge */}
      <Dialog open={confirmPurge} onOpenChange={open => !open && !purging && setConfirmPurge(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar todas las respuestas</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 py-2">
            Esta acción eliminará <strong>permanentemente</strong> todas las respuestas y
            todos los enlaces de evaluación generados. No se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmPurge(false)} disabled={purging}>
              Cancelar
            </Button>
            <Button
              onClick={handlePurge}
              disabled={purging}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {purging ? 'Eliminando…' : 'Eliminar todo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
