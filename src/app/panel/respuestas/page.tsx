'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getSubmissions, getSubmission } from '@/lib/api';
import type { Submission, Answer } from '@/types/panel';

export default function RespuestasPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading]         = useState(true);
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');
  const [search, setSearch]           = useState('');
  const [detail, setDetail]           = useState<{ submission: Submission; answers: Answer[] } | null>(null);
  const [detailOpen, setDetailOpen]   = useState(false);
  const [detailLoading, setDL]        = useState(false);

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

  useEffect(() => { load(); }, []);

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

  const scoreColor = (v: number) =>
    v <= 2 ? 'text-red-600 font-bold' : v === 3 ? 'text-amber-600 font-semibold' : 'text-accent-700 font-bold';

  const filtered = search.trim()
    ? submissions.filter(s =>
        s.company_name?.toLowerCase().includes(search.trim().toLowerCase())
      )
    : submissions;

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-xl font-bold text-slate-800">Respuestas</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
        <span className="text-slate-400 text-sm">—</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
        <Button size="sm" onClick={load} className="bg-primary-700 hover:bg-primary-600">Filtrar</Button>
        <Button size="sm" variant="outline" onClick={() => { setDateFrom(''); setDateTo(''); }}>Reset</Button>
        <input
          type="text"
          placeholder="Buscar empresa…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[160px]"
        />
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : submissions.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">Sin respuestas en el periodo</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">Sin resultados para &quot;{search}&quot;</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Folio</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Empresa</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Ver</th>
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
                      <td className="px-4 py-3 text-slate-600">
                        {(s.services as { folio: string | null } | null)?.folio ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-700 text-xs">
                        {s.company_name ?? <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openDetail(s.id)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              {/* Metadatos */}
              <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 space-y-1">
                <p><span className="font-medium">Fecha:</span> {new Date(detail.submission.submitted_at).toLocaleString('es-MX')}</p>
                <p><span className="font-medium">Código:</span> {(detail.submission.feedback_links as { code: string } | null)?.code ?? '—'}</p>
                <p><span className="font-medium">Folio:</span> {(detail.submission.services as { folio: string | null } | null)?.folio ?? '—'}</p>
                {detail.submission.company_name && (
                  <p><span className="font-medium">Empresa:</span> {detail.submission.company_name}</p>
                )}
              </div>

              {/* Respuestas agrupadas por tema */}
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
                    {/* Comentarios */}
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
    </div>
  );
}
