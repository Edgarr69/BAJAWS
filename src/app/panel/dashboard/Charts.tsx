'use client';

import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import type { AggregateMetric } from '@/types/panel';

// Wrapper para aislar recharts en un chunk dinámico (~120KB)

export function TopicBarChart({ data }: { data: AggregateMetric[] }) {
  return (
    <div role="img" aria-label="Gráfico de barras: promedio de score por tema">
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={data} margin={{ left: -20 }}>
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
    </div>
  );
}

export function TrendLineChart({ data }: { data: Array<AggregateMetric & { fecha: string }> }) {
  return (
    <div role="img" aria-label="Gráfico de línea: tendencia de score promedio por período">
    <ResponsiveContainer width="100%" height={210}>
      <LineChart data={data} margin={{ left: -20 }}>
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
    </div>
  );
}

export function StackedBarChart({ data }: {
  data: Array<{ topic: string; 'Negativo (1-2)': number; 'Neutral (3)': number; 'Positivo (4-5)': number }>;
}) {
  return (
    <div role="img" aria-label="Gráfico de barras apiladas: distribución de respuestas negativas, neutrales y positivas por tema">
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={data} margin={{ left: -20 }}>
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
    </div>
  );
}

// Score mensual — agrega datos semanales en meses para una tendencia más legible
export function MonthlyTrendChart({ data }: { data: Array<{ mes: string; score: number }> }) {
  return (
    <div role="img" aria-label="Gráfico de área: tendencia mensual de score de satisfacción">
    <ResponsiveContainer width="100%" height={210}>
      <AreaChart data={data} margin={{ left: -20 }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#0B3C5D" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#0B3C5D" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="mes" tick={{ fontSize: 11 }} tickLine={false} />
        <YAxis domain={[1, 5]} tick={{ fontSize: 11 }} tickLine={false} />
        <Tooltip formatter={(v) => [
          typeof v === 'number' ? `${v.toFixed(2)} / 5` : String(v ?? ''),
          'Score',
        ]} />
        <Area
          type="monotone" dataKey="score" name="Score"
          stroke="#0B3C5D" strokeWidth={2}
          fill="url(#scoreGrad)"
          dot={{ fill: '#0B3C5D', r: 3 }}
          activeDot={{ r: 5 }}
          isAnimationActive animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
    </div>
  );
}

// Preguntas peor evaluadas — lista con barra de progreso, sin recharts
export function QuestionRankingChart({ data }: { data: AggregateMetric[] }) {
  const items = [...data]
    .filter(d => d.question_text && d.avg_score != null)
    .sort((a, b) => a.avg_score - b.avg_score)
    .slice(0, 6);

  if (items.length === 0) return (
    <p className="text-sm text-slate-400 text-center py-8">Sin datos</p>
  );

  return (
    <div className="space-y-3">
      {items.map((d, i) => {
        const pct       = (d.avg_score / 5) * 100;
        const isRed     = d.avg_score < 3;
        const isAmber   = d.avg_score >= 3 && d.avg_score < 4;
        const barColor  = isRed ? 'bg-red-500'    : isAmber ? 'bg-amber-400'    : 'bg-accent-500';
        const numColor  = isRed ? 'text-red-600'  : isAmber ? 'text-amber-600'  : 'text-accent-700';
        const topicCls  = isRed ? 'bg-red-50 text-red-500 border-red-100'
                        : isAmber ? 'bg-amber-50 text-amber-600 border-amber-100'
                        : 'bg-accent-50 text-accent-700 border-accent-100';
        return (
          <div key={i} className="space-y-1.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 min-w-0 flex-1">
                {d.topic && (
                  <span className={`mt-0.5 shrink-0 text-[10px] font-semibold border rounded px-1.5 py-0.5 leading-none ${topicCls}`}>
                    {d.topic.split(' ')[0]}
                  </span>
                )}
                <span className="text-xs text-slate-700 leading-snug line-clamp-2">
                  {d.question_text}
                </span>
              </div>
              <span className={`shrink-0 text-sm font-bold tabular-nums ${numColor}`}>
                {d.avg_score.toFixed(1)}<span className="text-[10px] font-normal text-slate-400">/5</span>
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor}`}
                style={{ width: `${pct}%`, transition: 'width 0.6s ease' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ProfileRadarChart({ data }: {
  data: Array<{ subject: string; score: number; fullMark: number }>;
}) {
  return (
    <div role="img" aria-label="Gráfico de radar: perfil de scores por dimensión de evaluación">
    <ResponsiveContainer width="100%" height={210}>
      <RadarChart data={data} outerRadius={70}>
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
    </div>
  );
}
