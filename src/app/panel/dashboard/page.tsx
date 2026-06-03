'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCard } from '@/components/panel/KpiCard';
import { getMetrics, getLinkStats } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import type { AggregateMetric } from '@/types/panel';
import { NumberTicker } from '@/components/ui/number-ticker';

// Charts cargados dinámicamente para sacar recharts (~120KB) del bundle inicial
const TopicBarChart        = dynamic(() => import('./Charts').then(m => m.TopicBarChart),        { ssr: false, loading: () => null });
const MonthlyTrendChart    = dynamic(() => import('./Charts').then(m => m.MonthlyTrendChart),    { ssr: false, loading: () => null });
const QuestionRankingChart = dynamic(() => import('./Charts').then(m => m.QuestionRankingChart), { ssr: false, loading: () => null });
const ProfileRadarChart    = dynamic(() => import('./Charts').then(m => m.ProfileRadarChart),    { ssr: false, loading: () => null });

const today = new Date().toISOString().slice(0, 10);

const KEYS = { from: 'dash_dateFrom', to: 'dash_dateTo' } as const;

function savedDate(key: string): string | null {
  try {
    const v = localStorage.getItem(key);
    return v && /^\d{4}-\d{2}-\d{2}$/.test(v) && v <= today ? v : null;
  } catch { return null; }
}

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
  const [loading, setLoading]         = useState(true);
  const [topicData, setTopicData]     = useState<AggregateMetric[]>([]);
  const [trendData, setTrendData]     = useState<AggregateMetric[]>([]);
  const [questionData, setQuestionData] = useState<AggregateMetric[]>([]);
  const [linkStats, setLinkStats]     = useState({ total: 0, used: 0, pct: 0 });
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');
  const [ready, setReady]             = useState(false);

  const load = useCallback(async (from: string, to: string) => {
    setLoading(true);
    try {
      const [topicRes, trendRes, questionRes, stats] = await Promise.all([
        getMetrics({ date_from: from, date_to: to, group_by: 'topic' }),
        getMetrics({ date_from: from, date_to: to, group_by: 'week' }),
        getMetrics({ date_from: from, date_to: to, group_by: 'question' }),
        getLinkStats({ date_from: from, date_to: to }),
      ]);
      setTopicData(topicRes.data ?? []);
      setTrendData(trendRes.data ?? []);
      setQuestionData(questionRes.data ?? []);
      setLinkStats(stats);
    } catch {
      toast.error('Error al cargar métricas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Leer localStorage después de la hidratación para evitar mismatch SSR/cliente
  useEffect(() => {
    try {
      const from = savedDate(KEYS.from) ?? '';
      const to   = savedDate(KEYS.to)   ?? '';
      setDateFrom(from);
      setDateTo(to);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    load(dateFrom, dateTo);
  }, [ready, load, dateFrom, dateTo]);

  // Persistencia de filtros
  useEffect(() => { try { localStorage.setItem(KEYS.from, dateFrom); } catch {} }, [dateFrom]);
  useEffect(() => { try { localStorage.setItem(KEYS.to,   dateTo);   } catch {} }, [dateTo]);

  // Agregar datos semanales en meses para la gráfica de tendencia
  const monthlyData = useMemo(() => {
    const byMonth: Record<string, number[]> = {};
    for (const d of trendData) {
      const month = (d.week_start ?? d.date ?? '').slice(0, 7);
      if (!month) continue;
      if (!byMonth[month]) byMonth[month] = [];
      if (d.avg_score_global != null) byMonth[month].push(d.avg_score_global);
    }
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, scores]) => ({
        mes:   new Date(month + '-15').toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }),
        score: scores.length ? +(scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(2) : 0,
      }));
  }, [trendData]);

  // Limpiar al cerrar sesión
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_OUT') {
        try {
          localStorage.removeItem(KEYS.from);
          localStorage.removeItem(KEYS.to);
          localStorage.removeItem('dash_groupBy');
        } catch {}
      }
    });
    return () => subscription.unsubscribe();
  }, []);

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
            type="date" value={dateFrom} max={dateTo || today}
            onChange={e => setDateFrom(e.target.value)}
            className="text-base md:text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-slate-400 text-sm">—</span>
          <input
            type="date" value={dateTo} min={dateFrom} max={today}
            onChange={e => setDateTo(e.target.value)}
            className="text-base md:text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Button size="sm" onClick={() => load(dateFrom, dateTo)} className="bg-primary-700 hover:bg-primary-600">
            Aplicar
          </Button>
          <Button size="sm" variant="outline" onClick={() => {
            setDateFrom(''); setDateTo('');
            load('', '');
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

      {/* ── Fila 1: vista general por tema ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Promedio por tema</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-52 w-full" /> : (
              <TopicBarChart data={topicData} />
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Perfil de evaluación</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-52 w-full" /> : (
              <ProfileRadarChart data={radarData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Fila 2: tendencia mensual — ancho completo ───────────────────────── */}
      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">Tendencia de score mensual</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-52 w-full" /> : (
            <MonthlyTrendChart data={monthlyData} />
          )}
        </CardContent>
      </Card>

      {/* ── Fila 3: detalle accionable ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Preguntas con menor calificación</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-52 w-full" /> : (
              <QuestionRankingChart data={questionData} />
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Temas peor evaluados</CardTitle>
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
