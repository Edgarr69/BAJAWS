'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCard } from '@/components/panel/KpiCard';
import { getMetrics, getLinkStats } from '@/lib/api';
import type { AggregateMetric } from '@/types/panel';
import { NumberTicker } from '@/components/ui/number-ticker';

const today    = new Date().toISOString().slice(0, 10);
const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

// ── KPI animado ───────────────────────────────────────────────────────────────

function AnimatedKpi({
  title, numValue, decimalPlaces = 0, suffix = '', subtitle, color, loading,
}: {
  title: string;
  numValue: number;
  decimalPlaces?: number;
  suffix?: string;
  subtitle?: string;
  color?: 'blue' | 'green' | 'red' | 'gray';
  loading?: boolean;
}) {
  return (
    <KpiCard
      title={title}
      value={loading ? '…' : (
        <span>
          <NumberTicker key={numValue} value={numValue} decimalPlaces={decimalPlaces} />
          {suffix}
        </span>
      )}
      subtitle={subtitle}
      color={color}
      loading={loading}
    />
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const [loading, setLoading]     = useState(true);
  const [topicData, setTopicData] = useState<AggregateMetric[]>([]);
  const [trendData, setTrendData] = useState<AggregateMetric[]>([]);
  const [linkStats, setLinkStats] = useState({ total: 0, used: 0, pct: 0 });
  const [dateFrom, setDateFrom]   = useState(monthAgo);
  const [dateTo, setDateTo]       = useState(today);
  const [groupBy, setGroupBy]     = useState<'day' | 'week'>('day');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [topicRes, trendRes, stats] = await Promise.all([
        getMetrics({ date_from: dateFrom, date_to: dateTo, group_by: 'topic' }),
        getMetrics({ date_from: dateFrom, date_to: dateTo, group_by: groupBy }),
        getLinkStats({ date_from: dateFrom, date_to: dateTo }),
      ]);
      setTopicData(topicRes.data ?? []);
      setTrendData(trendRes.data ?? []);
      setLinkStats(stats);
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

  const worst5 = [...topicData].sort((a, b) => a.avg_score - b.avg_score).slice(0, 5);

  const stackedData = topicData.map(d => ({
    topic: d.topic?.split(' ')[0] ?? '',
    'Negativo (1-2)': (d.dist_1 ?? 0) + (d.dist_2 ?? 0),
    'Neutral (3)': d.dist_3 ?? 0,
    'Positivo (4-5)': (d.dist_4 ?? 0) + (d.dist_5 ?? 0),
  }));

  const radarData = topicData.map(d => ({
    subject: d.topic?.split(' ')[0] ?? '',
    score:   d.avg_score,
    fullMark: 5,
  }));

  function statusBorderColor(avg: number) {
    if (avg >= 4.25) return 'border-accent-500';
    if (avg >= 3.5)  return 'border-amber-400';
    return 'border-red-500';
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ── Filtros ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
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

      {/* ── KPIs ─────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedKpi title="Score global"     numValue={globalAvg}   decimalPlaces={2}           subtitle="Escala 1–5"     color="blue"  loading={loading} />
        <AnimatedKpi title="% Positivos"      numValue={pctPositive} decimalPlaces={1} suffix="%" subtitle="Respuestas 4–5" color="green" loading={loading} />
        <AnimatedKpi title="% Negativos"      numValue={pctNegative} decimalPlaces={1} suffix="%" subtitle="Respuestas 1–2" color="red"   loading={loading} />
        <AnimatedKpi
          title="Formularios contestados"
          numValue={linkStats.pct}
          suffix="%"
          subtitle={`${linkStats.used} de ${linkStats.total} enviados`}
          color={linkStats.pct >= 70 ? 'green' : linkStats.pct >= 40 ? 'blue' : 'red'}
          loading={loading}
        />
      </div>

      {/* ── Gráficas fila 1 ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Tooltip formatter={(v) => [
                    typeof v === 'number' ? `${v.toFixed(2)} / 5` : String(v ?? ''),
                    'Promedio',
                  ]} />
                  <Bar dataKey="avg_score" name="Promedio" fill="#0B3C5D" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

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
                  data={trendData.map(d => ({ ...d, fecha: d.date ?? d.week_start ?? '' }))}
                  margin={{ left: -20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis domain={[1, 5]} tick={{ fontSize: 11 }} tickLine={false} />
                  <Tooltip formatter={(v) => [
                    typeof v === 'number' ? `${v.toFixed(2)} / 5` : String(v ?? ''),
                    'Score',
                  ]} />
                  <Line
                    type="monotone" dataKey="avg_score_global" name="Score"
                    stroke="#3D8B36" strokeWidth={2} dot={false}
                    isAnimationActive animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Gráficas fila 2 ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <Tooltip formatter={(v, name) => [`${v ?? 0} resp.`, name ?? '']} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Negativo (1-2)" stackId="a" fill="#ef4444" isAnimationActive animationDuration={800} />
                  <Bar dataKey="Neutral (3)"    stackId="a" fill="#f59e0b" isAnimationActive animationDuration={800} />
                  <Bar dataKey="Positivo (4-5)" stackId="a" fill="#3D8B36" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Perfil de evaluación</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-52 w-full" /> : (
              <ResponsiveContainer width="100%" height={210}>
                <RadarChart data={radarData} outerRadius={70}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#0B3C5D"
                    fill="#0B3C5D"
                    fillOpacity={0.25}
                    isAnimationActive
                    animationDuration={800}
                  />
                  <Tooltip formatter={(v) => [
                    typeof v === 'number' ? `${v.toFixed(2)} / 5` : String(v ?? ''),
                    'Score',
                  ]} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

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
                  <div
                    key={i}
                    className={`flex items-center justify-between py-2 pl-2 border-b border-slate-100 last:border-0 border-l-4 ${statusBorderColor(d.avg_score)}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-700">{d.topic}</p>
                      <p className="text-xs text-slate-400">{d.total_responses} resp. · {d.pct_positive.toFixed(0)}% positivas</p>
                    </div>
                    <span className={`text-sm font-bold ${d.avg_score < 3.5 ? 'text-red-600' : d.avg_score < 4.25 ? 'text-amber-500' : 'text-accent-600'}`}>
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
