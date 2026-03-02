'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getMetrics, getRawAnswers, getMe } from '@/lib/api';

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map(r =>
      headers.map(h => {
        const v = String(r[h] ?? '');
        return v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;
      }).join(',')
    ),
  ];
  return lines.join('\n');
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ExportacionesPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [loading, setLoading]   = useState<string | null>(null);
  const [role, setRole]         = useState<string>('atencion');

  // Cargar rol al montar
  useEffect(() => {
    getMe().then(me => setRole(me.role)).catch(() => {});
  }, []);

  async function exportAgregado() {
    setLoading('agregado');
    try {
      const params: Record<string, string> = { group_by: 'topic' };
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo)   params.date_to   = dateTo;
      const res = await getMetrics(params);
      const csv = toCSV((res as { data: Record<string, unknown>[] }).data ?? []);
      downloadCSV(csv, `metricas-agregadas-${Date.now()}.csv`);
      toast.success('Exportación descargada');
    } catch {
      toast.error('Error al exportar');
    } finally {
      setLoading(null);
    }
  }

  async function exportRaw() {
    setLoading('raw');
    try {
      const params: Record<string, string> = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo)   params.date_to   = dateTo;
      const res = await getRawAnswers(params);
      const csv = toCSV((res as { data: Record<string, unknown>[] }).data ?? []);
      downloadCSV(csv, `respuestas-raw-${Date.now()}.csv`);
      toast.success('Exportación descargada');
    } catch {
      toast.error('Error al exportar');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-slate-800">Exportaciones</h1>

      {/* Filtro de fechas */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Rango de fechas (opcional)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1.5">
            <Label className="text-xs">Desde</Label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Hasta</Label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <Button variant="outline" size="sm" onClick={() => { setDateFrom(''); setDateTo(''); }}>
            Limpiar
          </Button>
        </CardContent>
      </Card>

      {/* Opciones de descarga */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-slate-200">
          <CardContent className="pt-5 space-y-3">
            <div>
              <p className="font-medium text-slate-800 text-sm">Métricas agregadas</p>
              <p className="text-xs text-slate-500 mt-1">Promedios y distribución por tema. Disponible para todos los roles.</p>
            </div>
            <Button
              onClick={exportAgregado}
              disabled={!!loading}
              className="w-full bg-primary-700 hover:bg-primary-600 gap-2"
            >
              <Download className="w-4 h-4" />
              {loading === 'agregado' ? 'Exportando…' : 'Descargar CSV'}
            </Button>
          </CardContent>
        </Card>

        {role === 'admin' && (
          <Card className="border-slate-200">
            <CardContent className="pt-5 space-y-3">
              <div>
                <p className="font-medium text-slate-800 text-sm">Respuestas raw</p>
                <p className="text-xs text-slate-500 mt-1">Pregunta → respuesta + comentario por cliente. Solo administradores.</p>
              </div>
              <Button
                onClick={exportRaw}
                disabled={!!loading}
                variant="outline"
                className="w-full gap-2 border-primary-200 text-primary-700 hover:bg-primary-50"
              >
                <Download className="w-4 h-4" />
                {loading === 'raw' ? 'Exportando…' : 'Descargar CSV'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
