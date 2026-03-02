'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCard } from '@/components/panel/KpiCard';
import { getMetrics } from '@/lib/api';
import type { AggregateMetric } from '@/types/panel';

const today = new Date().toISOString().slice(0, 10);
const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

export default function DashboardPage() {
  const [loading, setLoading]     = useState(true);
  const [topicData, setTopicData] = useState<AggregateMetric[]>([]);
  const [trendData, setTrendData] = useState<AggregateMetric[]>([]);
  const [dateFrom, setDateFrom]   = useState(monthAgo);
  const [dateTo, setDateTo]       = useState(today);
  const [groupBy, setGroupBy]     = useState<'day' | 'week'>('day');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [topicRes, trendRes] = await Promise.all([
        getMetrics({ date_from: dateFrom, date_to: dateTo, group_by: 'topic' }),
        getMetrics({ date_from: dateFrom, date_to: dateTo, group_by: groupBy }),
      ]);
      setTopicData((topicRes as { data: AggregateMetric[] }).data ?? []);
      setTrendData((trendRes as { data: AggregateMetric[] }).data ?? []);
    } catch {
      toast.error('Error al cargar métricas');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, groupBy]);

  useEffect(() => { load(); }, [load]);

  const totalResponses = topicData.reduce((s, d) => s + (d.total_responses ?? 0), 0);
  const globalAvg = topicData.length
    ? topicData.reduce((s, d) => s + d.avg_score * d.total_responses, 0) / (totalResponses || 1)
    : 0;
  const pctPositive = topicData.length
    ? topicData.reduce((s, d) => s + d.pct_positive * d.total_responses, 0) / (totalResponses || 1)
    : 0;
  const pctNegative = topicData.length
    ? topicData.reduce((s, d) => s + d.pct_negative * d.total_responses, 0) / (totalResponses || 1)
    : 0;

  const worst5 = [...topicData]
    .sort((a, b) => a.avg_score - b.avg_score)
    .slice(0, 5);

  // Stacked bar: agrupar 1-2 / 3 / 4-5
  const stackedData = topicData.map(d => ({
    topic: d.topic?.split(' ')[0] ?? '',
    'Negativo (1-2)': (d.dist_1 ?? 0) + (d.dist_2 ?? 0),
    'Neutral (3)': d.dist_3 ?? 0,
    'Positivo (4-5)': (d.dist_4 ?? 0) + (d.dist_5 ?? 0),
  }));

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        {/* Filtros */}
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="date" value={dateFrom} max={dateTo}
            onChange={e => setDateFrom(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-slate-400 text-sm">—</span>
          <input
            type="date" value={dateTo} min={dateFrom}
            onChange={e => setDateTo(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Select value={groupBy} onValueChange={v => setGroupBy(v as 'day' | 'week')}>
            <SelectTrigger className="w-28 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Por día</SelectItem>
              <SelectItem value="week">Por semana</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={load} className="bg-primary-700 hover:bg-primary-600">
            Aplicar
          </Button>
          <Button size="sm" variant="outline" onClick={() => {
            setDateFrom(monthAgo); setDateTo(today); setGroupBy('day');
          }}>
            Reset
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Score global" value={loading ? '…' : globalAvg.toFixed(2)} subtitle="Escala 1–5" color="blue" loading={loading} />
        <KpiCard title="% Positivos" value={loading ? '…' : `${pctPositive.toFixed(1)}%`} subtitle="Respuestas 4–5" color="green" loading={loading} />
        <KpiCard title="% Negativos" value={loading ? '…' : `${pctNegative.toFixed(1)}%`} subtitle="Respuestas 1–2" color="red" loading={loading} />
        <KpiCard title="Total respuestas" value={loading ? '…' : totalResponses} subtitle="En el periodo" color="gray" loading={loading} />
      </div>

      {/* Gráficas fila 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* A) Bar: promedio por tema */}
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Promedio por tema</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-52 w-full" /> : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={topicData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="topic" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} tickLine={false} />
                  <Tooltip formatter={(v) => typeof v === 'number' ? v.toFixed(2) : String(v ?? '')} />
                  <Bar dataKey="avg_score" name="Promedio" fill="#0B3C5D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* B) Line: tendencia score global */}
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Tendencia score global ({groupBy === 'day' ? 'diaria' : 'semanal'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-52 w-full" /> : (
              <ResponsiveContainer width="100%" height={210}>
                <LineChart
                  data={trendData.map(d => ({
                    ...d,
                    fecha: d.date ?? d.week_start ?? '',
                  }))}
                  margin={{ left: -20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis domain={[1, 5]} tick={{ fontSize: 11 }} tickLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone" dataKey="avg_score_global" name="Score"
                    stroke="#3D8B36" strokeWidth={2} dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficas fila 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* C) Stacked bar: distribución */}
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Distribución por tema</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-52 w-full" /> : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={stackedData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="topic" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Negativo (1-2)" stackId="a" fill="#ef4444" />
                  <Bar dataKey="Neutral (3)"   stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Positivo (4-5)" stackId="a" fill="#3D8B36" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* D) Tabla: top 5 peores */}
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Top 5 temas peor evaluados</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-52 w-full" /> : (
              <div className="space-y-2">
                {worst5.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-8">Sin datos</p>
                )}
                {worst5.map((d, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{d.topic}</p>
                      <p className="text-xs text-slate-400">{d.total_responses} respuestas</p>
                    </div>
                    <span className={`text-sm font-bold ${d.avg_score < 3 ? 'text-red-600' : d.avg_score < 4 ? 'text-amber-500' : 'text-accent-600'}`}>
                      {d.avg_score.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
