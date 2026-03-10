'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { FileDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { getSubmissions } from '@/lib/api';
import dynamic from 'next/dynamic';
import type { ReportData } from '@/types/report';

const today    = new Date().toISOString().slice(0, 10);
const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

const PdfReportTemplateLazy = dynamic(
  () => import('@/components/panel/PdfReportTemplate').then(m => ({ default: m.PdfReportTemplate })),
  { ssr: false }
);

export default function ExportacionesPage() {
  const searchParams = useSearchParams();
  const [companies, setCompanies]   = useState<string[]>([]);
  const [loadingCo, setLoadingCo]   = useState(true);
  const [company, setCompany]       = useState(searchParams.get('empresa') ?? '__all__');
  const [dateFrom, setDateFrom]     = useState(searchParams.get('date_from') ?? monthAgo);
  const [dateTo, setDateTo]         = useState(searchParams.get('date_to') ?? today);
  const [dateError, setDateError]   = useState('');
  const [generating, setGenerating] = useState(false);
  const [reportMounted, setReportMounted] = useState(false);
  const reportDataRef = useRef<ReportData | null>(null);

  // Cargar lista de empresas únicas
  useEffect(() => {
    getSubmissions()
      .then(subs => {
        const unique = Array.from(
          new Set(subs.map(s => s.company_name).filter(Boolean) as string[])
        ).sort();
        setCompanies(unique);
      })
      .catch(() => { /* sin empresas disponibles */ })
      .finally(() => setLoadingCo(false));
  }, []);

  function validateDates(): boolean {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setDateError('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return false;
    }
    setDateError('');
    return true;
  }

  async function handleGenerate() {
    if (!validateDates()) return;
    setGenerating(true);
    try {
      const { buildReportData } = await import('@/lib/report-data');
      const data = await buildReportData({
        companyName: company !== '__all__' ? company : undefined,
        dateFrom:    dateFrom || null,
        dateTo:      dateTo   || null,
      });

      if (data.summary.totalResponses === 0) {
        toast.info('No hay datos para el filtro seleccionado. Ajusta las fechas o la empresa.');
        setGenerating(false);
        return;
      }

      reportDataRef.current = data;
      setReportMounted(true);

      // Dar tiempo a React para montar y pintar el template
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
                <SelectTrigger className="h-9 text-sm bg-white">
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

          {/* Fechas */}
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Desde</Label>
              <input
                type="date"
                value={dateFrom}
                max={dateTo || today}
                onChange={e => { setDateFrom(e.target.value); setDateError(''); }}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white h-9 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white h-9 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            disabled={generating || !!dateError}
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

      {/* Template PDF oculto — montado solo durante la generación */}
      {reportMounted && reportDataRef.current && (
        <PdfReportTemplateLazy data={reportDataRef.current} />
      )}
    </div>
  );
}
