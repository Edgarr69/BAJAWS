'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { FileDown, Calendar, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getSubmissions, getSubmission } from '@/lib/api';
import dynamic from 'next/dynamic';
import type { ReportData } from '@/types/report';
import type { Submission, Answer } from '@/types/panel';

const today    = new Date().toISOString().slice(0, 10);
const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

const PdfReportTemplateLazy = dynamic(
  () => import('@/components/panel/PdfReportTemplate').then(m => ({ default: m.PdfReportTemplate })),
  { ssr: false }
);

function fmtSub(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ExportacionesPage() {
  const searchParams = useSearchParams();

  // Lista de empresas / submissions
  const [allSubs, setAllSubs]       = useState<Submission[]>([]);
  const [companies, setCompanies]   = useState<string[]>([]);
  const [loadingCo, setLoadingCo]   = useState(true);

  // Filtros
  const [company, setCompany]       = useState(searchParams.get('empresa') ?? '__all__');
  const [dateFrom, setDateFrom]     = useState(searchParams.get('date_from') ?? monthAgo);
  const [dateTo, setDateTo]         = useState(searchParams.get('date_to') ?? today);
  const [dateError, setDateError]   = useState('');

  // Selección de encuestas (modo empresa)
  const [companySubs, setCompanySubs]     = useState<Submission[] | null>(null);
  const [showSubModal, setShowSubModal]   = useState(false);
  const [selectedSubIds, setSelectedSubIds] = useState<Set<string>>(new Set());

  // Preview de encuesta individual
  const [previewOpen, setPreviewOpen]       = useState(false);
  const [previewData, setPreviewData]       = useState<{ submission: Submission; answers: Answer[] } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // PDF
  const [generating, setGenerating] = useState(false);
  const [reportMounted, setReportMounted] = useState(false);
  const reportDataRef = useRef<ReportData | null>(null);

  // Carga inicial — guarda todos los submissions para no repetir el request
  useEffect(() => {
    getSubmissions()
      .then(subs => {
        setAllSubs(subs);
        const unique = Array.from(
          new Set(subs.map(s => s.company_name).filter(Boolean) as string[])
        ).sort();
        setCompanies(unique);
      })
      .catch(() => {})
      .finally(() => setLoadingCo(false));
  }, []);

  // Al cambiar empresa específica → filtrar y abrir modal
  useEffect(() => {
    if (company === '__all__' || !allSubs.length) {
      setCompanySubs(null);
      setSelectedSubIds(new Set());
      setShowSubModal(false);
      return;
    }
    const filtered = allSubs
      .filter(s => s.company_name?.toLowerCase() === company.toLowerCase())
      .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
    setCompanySubs(filtered);
    setSelectedSubIds(new Set(filtered.map(s => s.id)));
    if (filtered.length > 0) setShowSubModal(true);
  }, [company, allSubs]);

  async function openPreview(id: string) {
    setPreviewOpen(true);
    setPreviewLoading(true);
    try {
      const d = await getSubmission(id);
      setPreviewData(d as { submission: Submission; answers: Answer[] });
    } catch {
      toast.error('Error cargando detalle');
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  }

  const scoreColor = (v: number) =>
    v <= 2 ? 'text-red-600 font-bold' : v === 3 ? 'text-amber-600 font-semibold' : 'text-accent-700 font-bold';

  function validateDates(): boolean {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setDateError('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return false;
    }
    setDateError('');
    return true;
  }

  async function handleGenerate() {
    if (company === '__all__' && !validateDates()) return;
    if (company !== '__all__' && selectedSubIds.size === 0) {
      toast.info('Selecciona al menos una encuesta para generar el reporte.');
      return;
    }
    setGenerating(true);
    try {
      const { buildReportData } = await import('@/lib/report-data');
      const data = await buildReportData({
        companyName:   company !== '__all__' ? company : undefined,
        dateFrom:      company !== '__all__' ? null : (dateFrom || null),
        dateTo:        company !== '__all__' ? null : (dateTo   || null),
        submissionIds: company !== '__all__' ? Array.from(selectedSubIds) : undefined,
      });

      if (data.summary.totalResponses === 0) {
        toast.info('No hay datos para el filtro seleccionado. Ajusta las fechas o la empresa.');
        setGenerating(false);
        return;
      }

      reportDataRef.current = data;
      setReportMounted(true);

      await new Promise(r => setTimeout(r, 300));

      const { generatePdf }   = await import('@/lib/generate-pdf');
      const { getPdfPageIds } = await import('@/components/panel/PdfReportTemplate');
      const co   = company !== '__all__' ? company.toLowerCase().replace(/\s+/g, '-') : 'general';
      const from = dateFrom || 'inicio';
      const to   = dateTo   || 'fin';
      const filename = `reporte_evaluacion_${co}_${from}_${to}.pdf`;

      await generatePdf(getPdfPageIds(data), filename);
      toast.success('PDF generado y descargado correctamente');
    } catch (err) {
      console.error(err);
      toast.error('Error al generar el PDF. Intenta de nuevo.');
    } finally {
      setGenerating(false);
      setReportMounted(false);
      reportDataRef.current = null;
    }
  }

  const selectedCount = selectedSubIds.size;
  const totalCount    = companySubs?.length ?? 0;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-slate-800">Exportaciones</h1>

      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FileDown className="w-4 h-4 text-primary-700" />
            Generar reporte PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Empresa */}
          <div className="space-y-1.5">
            <Label className="text-xs">Empresa</Label>
            {loadingCo ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select value={company} onValueChange={setCompany}>
                <SelectTrigger className="h-9 text-base md:text-sm bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todas las evaluaciones (general)</SelectItem>
                  {companies.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {!loadingCo && companies.length === 0 && (
              <p className="text-xs text-slate-400">
                No hay empresas registradas aún. Las empresas aparecen aquí cuando los clientes completan el formulario con su nombre.
              </p>
            )}
          </div>

          {/* Resumen de encuestas seleccionadas (modo empresa) */}
          {company !== '__all__' && companySubs !== null && (
            <div className="flex items-center justify-between bg-primary-50 border border-primary-100 rounded-lg px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-600 shrink-0" />
                <span className="text-sm text-slate-700">
                  <span className="font-semibold text-primary-700">{selectedCount}</span>
                  {' '}de{' '}
                  <span className="font-semibold">{totalCount}</span>
                  {' '}encuesta{totalCount !== 1 ? 's' : ''} seleccionada{selectedCount !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => setShowSubModal(true)}
                className="text-xs text-primary-600 hover:text-primary-800 font-medium underline transition-colors"
              >
                Cambiar selección
              </button>
            </div>
          )}

          {/* Fechas — solo en modo general */}
          {company === '__all__' && (
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Desde</Label>
                <input
                  type="date"
                  value={dateFrom}
                  max={dateTo || today}
                  onChange={e => { setDateFrom(e.target.value); setDateError(''); }}
                  className="text-base md:text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white h-9 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Hasta</Label>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom}
                  max={today}
                  onChange={e => { setDateTo(e.target.value); setDateError(''); }}
                  className="text-base md:text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white h-9 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => { setDateFrom(monthAgo); setDateTo(today); setDateError(''); }}
                >
                  Reset fechas
                </Button>
              </div>
            </div>
          )}

          {dateError && (
            <p className="text-xs text-red-600">{dateError}</p>
          )}

          {/* Descripción del contenido */}
          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 space-y-1">
            <p className="font-medium text-slate-700">El reporte incluye:</p>
            <ul className="list-disc list-inside space-y-0.5 pl-1">
              <li>Score global y métricas de satisfacción</li>
              <li>Resultados por categoría con gráfica de barras</li>
              <li>Diagnóstico y hallazgos del período</li>
              <li>Planes de acción para categorías con bajo desempeño</li>
              {company !== '__all__' && <li>Detalle por pregunta para la empresa seleccionada</li>}
            </ul>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating || !!dateError || (company !== '__all__' && selectedCount === 0)}
            className="w-full bg-primary-700 hover:bg-primary-600 gap-2"
          >
            {generating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Generando PDF…
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                Generar y descargar PDF
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* ── Modal de selección de encuestas ───────────────────────────────────── */}
      <Dialog
        open={showSubModal}
        onOpenChange={open => {
          if (!open) setShowSubModal(false);
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onOpenAutoFocus={e => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Encuestas disponibles — {company}</DialogTitle>
          </DialogHeader>

          {companySubs && companySubs.length > 0 ? (
            <>
              {/* Controles de selección masiva */}
              <div className="flex items-center gap-3 text-xs border-b border-slate-100 pb-3">
                <button
                  onClick={() => setSelectedSubIds(new Set(companySubs.map(s => s.id)))}
                  className="text-primary-600 hover:text-primary-800 font-medium transition-colors"
                >
                  Seleccionar todas
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() => setSelectedSubIds(new Set())}
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Ninguna
                </button>
                <span className="ml-auto text-slate-400">
                  {selectedSubIds.size} de {companySubs.length}
                </span>
              </div>

              {/* Lista de encuestas */}
              <div className="max-h-64 overflow-y-auto space-y-1 -mx-1 px-1">
                {companySubs.map((sub, i) => {
                  const checked = selectedSubIds.has(sub.id);
                  return (
                    <label
                      key={sub.id}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setSelectedSubIds(prev => {
                            const next = new Set(prev);
                            if (next.has(sub.id)) next.delete(sub.id);
                            else next.add(sub.id);
                            return next;
                          });
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700 flex-1">
                        {fmtSub(sub.submitted_at)}
                      </span>
                      <span className="text-xs text-slate-400 tabular-nums">
                        #{companySubs.length - i}
                      </span>
                      <button
                        type="button"
                        onClick={e => { e.preventDefault(); openPreview(sub.id); }}
                        className="text-slate-400 hover:text-primary-600 transition-colors p-0.5 shrink-0"
                        title="Ver respuestas"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </label>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400 py-4 text-center">
              No hay encuestas registradas para esta empresa.
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubModal(false)}>
              Cerrar
            </Button>
            <Button
              onClick={() => setShowSubModal(false)}
              disabled={selectedSubIds.size === 0}
              className="bg-primary-700 hover:bg-primary-600"
            >
              Confirmar ({selectedSubIds.size})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog preview de encuesta ───────────────────────────────────────── */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          className="max-w-2xl max-h-[85vh] overflow-y-auto"
          onOpenAutoFocus={e => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Detalle de respuestas</DialogTitle>
          </DialogHeader>
          {previewLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : previewData ? (
            <div className="space-y-5">
              <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 space-y-1">
                <p><span className="font-medium">Fecha:</span> {new Date(previewData.submission.submitted_at).toLocaleString('es-MX')}</p>
                <p><span className="font-medium">Código:</span> {(previewData.submission.feedback_links as { code: string } | null)?.code ?? '—'}</p>
                {previewData.submission.company_name && (
                  <p><span className="font-medium">Empresa:</span> {previewData.submission.company_name}</p>
                )}
              </div>
              {(() => {
                const grouped: Record<string, Answer[]> = {};
                for (const a of previewData.answers) {
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

      {/* Template PDF oculto — montado solo durante la generación */}
      {reportMounted && reportDataRef.current && (
        <PdfReportTemplateLazy data={reportDataRef.current} />
      )}
    </div>
  );
}
