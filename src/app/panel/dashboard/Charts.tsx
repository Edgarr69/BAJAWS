'use client';

import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import type { AggregateMetric } from '@/types/panel';

// Wrapper para aislar recharts en un chunk dinámico (~120KB)

export function TopicBarChart({ data }: { data: AggregateMetric[] }) {
  return (
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
  );
}

export function TrendLineChart({ data }: { data: Array<AggregateMetric & { fecha: string }> }) {
  return (
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
  );
}

export function StackedBarChart({ data }: {
  data: Array<{ topic: string; 'Negativo (1-2)': number; 'Neutral (3)': number; 'Positivo (4-5)': number }>;
}) {
  return (
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
  );
}

export function ProfileRadarChart({ data }: {
  data: Array<{ subject: string; score: number; fullMark: number }>;
}) {
  return (
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
  );
}
