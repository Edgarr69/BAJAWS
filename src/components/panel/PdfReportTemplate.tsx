'use client';

import type { ReportData, CategoryStat, PrivateComment } from '@/types/report';

// ── Constantes de estilo ──────────────────────────────────────────────────────

const PAGE: React.CSSProperties = {
  width: 794,
  backgroundColor: '#ffffff',
  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
  padding: '36px 36px 32px 36px',
  color: '#1e293b',
  boxSizing: 'border-box',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, d = 2) { return n.toFixed(d); }

function fmtDate(iso: string | null) {
  if (!iso) return '–';
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function catColor(avg: number) {
  if (avg >= 4.25) return '#3D8B36';
  if (avg >= 3.5)  return '#d97706';
  return '#dc2626';
}

// ── Componentes reutilizables ─────────────────────────────────────────────────

function ScoreBar({ value }: { value: number }) {
  const pct   = Math.max(0, Math.min(100, (value / 5) * 100));
  const color = catColor(value);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 110, flexShrink: 0, height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, width: 34, flexShrink: 0, textAlign: 'right' }}>{fmt(value)}</span>
    </div>
  );
}

/** Mini-encabezado de contexto para páginas 2 y 3 */
function PageContext({ data }: { data: ReportData }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      borderBottom: '2px solid #0B3C5D', paddingBottom: 10, marginBottom: 20,
    }}>
      <div>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#0B3C5D' }}>Baja Wastewater Solution</span>
        {data.meta.companyName && (
          <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>· {data.meta.companyName}</span>
        )}
      </div>
      <span style={{ fontSize: 10, color: '#94a3b8' }}>
        {fmtDate(data.meta.dateFrom)} – {fmtDate(data.meta.dateTo)}
      </span>
    </div>
  );
}

function PageFooter() {
  return (
    <div style={{
      marginTop: 28, paddingTop: 10, borderTop: '1px solid #e2e8f0',
      fontSize: 9, color: '#94a3b8', textAlign: 'center',
    }}>
      Reporte generado automáticamente — Baja Wastewater Solution
    </div>
  );
}

// ── Gráfica SVG ───────────────────────────────────────────────────────────────

function BarChartSvg({ categories, chartWidth = 722 }: { categories: CategoryStat[]; chartWidth?: number }) {
  const n = categories.length;
  if (!n) return null;

  const paddingL = 28;
  const paddingR = 8;
  const paddingT = 20;
  const labelH   = 44;
  const maxH     = 110;
  const gap      = 16;
  const usable   = chartWidth - paddingL - paddingR;
  const barW     = Math.floor((usable - (n - 1) * gap) / n);
  const totalH   = paddingT + maxH + labelH;

  return (
    <svg
      width={chartWidth}
      height={totalH}
      viewBox={`0 0 ${chartWidth} ${totalH}`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {[1, 2, 3, 4, 5].map(v => {
        const gy = paddingT + maxH - (v / 5) * maxH;
        return (
          <g key={v}>
            <line x1={paddingL} y1={gy} x2={chartWidth - paddingR} y2={gy}
              stroke={v === 5 ? '#cbd5e1' : '#f1f5f9'}
              strokeWidth={v === 5 ? 1 : 0.8}
              strokeDasharray={v < 5 ? '3 3' : '0'}
            />
            <text x={paddingL - 4} y={gy + 3} textAnchor="end" fontSize={8} fill="#94a3b8">{v}</text>
          </g>
        );
      })}
      <line x1={paddingL} y1={paddingT + maxH} x2={chartWidth - paddingR} y2={paddingT + maxH}
        stroke="#cbd5e1" strokeWidth={1.5} />

      {categories.map((cat, i) => {
        const x   = paddingL + i * (barW + gap);
        const h   = Math.max(3, (cat.avgScore / 5) * maxH);
        const y   = paddingT + maxH - h;
        const col = catColor(cat.avgScore);
        const words = cat.category.split(' ');
        const line1 = words.slice(0, 2).join(' ');
        const line2 = words.length > 2 ? words.slice(2).join(' ') : null;

        return (
          <g key={cat.category}>
            <rect x={x} y={y} width={barW} height={h} fill={col} rx={4} opacity={0.88} />
            <rect x={x} y={y} width={barW} height={Math.min(h, 12)} fill="white" rx={4} opacity={0.15} />
            <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize={11} fontWeight="700" fill={col}>
              {fmt(cat.avgScore, 1)}
            </text>
            <text x={x + barW / 2} y={paddingT + maxH + 13} textAnchor="middle" fontSize={9} fill="#475569" fontWeight="600">
              {line1}
            </text>
            {line2 && (
              <text x={x + barW / 2} y={paddingT + maxH + 24} textAnchor="middle" fontSize={9} fill="#475569" fontWeight="600">
                {line2}
              </text>
            )}
            <text x={x + barW / 2} y={paddingT + maxH + 37} textAnchor="middle" fontSize={8} fill="#94a3b8">
              {cat.pctPositive.toFixed(0)}% positivas
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 1 — Header + KPIs + Categorías + Hallazgos
// ══════════════════════════════════════════════════════════════════════════════

function Page1({ data }: { data: ReportData }) {
  const { meta, summary, byCategory, diagnostics } = data;

  return (
    <div id="pdf-page-1" style={PAGE}>
      {/* ── Header ── */}
      <div style={{ borderBottom: '2px solid #0B3C5D', paddingBottom: 16, marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0B3C5D', letterSpacing: '-0.3px' }}>
              Baja Wastewater Solution
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>
              Reporte de Evaluación del Servicio
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>
              Generado: {new Date(meta.generatedAt).toLocaleString('es-MX')}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 28, fontSize: 12, color: '#475569', flexWrap: 'wrap' }}>
          {meta.companyName && <span><strong>Empresa:</strong> {meta.companyName}</span>}
          <span><strong>Modo:</strong> {meta.scope === 'single' ? 'Evaluación individual' : 'Resumen general'}</span>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Score global',   value: fmt(summary.globalScore),             sub: '/ 5.00',        color: '#0B3C5D' },
          { label: '% Satisfacción', value: `${fmt(summary.globalScorePct, 1)}%`, sub: 'escala 0–100',  color: '#2980B9' },
          { label: 'Respuestas',     value: String(summary.totalResponses),        sub: 'en el período', color: '#0B3C5D' },
          { label: 'Evaluaciones',   value: String(summary.totalSubmissions),      sub: 'formularios',   color: '#3D8B36' },
        ].map(c => (
          <div key={c.label} style={{
            backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: 10, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: c.color, marginTop: 4, lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Resultados por categoría ── */}
      {byCategory.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0B3C5D', marginBottom: 10, borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
            Resultados por categoría
          </div>
          <div style={{ fontSize: 11, marginBottom: 16, border: '1px solid #f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 3fr 90px 72px',
              alignItems: 'center', backgroundColor: '#f1f5f9', padding: '7px 10px',
            }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Categoría</span>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Promedio</span>
              <span style={{ color: '#64748b', fontWeight: 600, textAlign: 'right' }}>% Positivo</span>
              <span style={{ color: '#64748b', fontWeight: 600, textAlign: 'right' }}>Respuestas</span>
            </div>
            {/* Filas */}
            {byCategory.map((c, i) => (
              <div key={c.category} style={{
                display: 'grid', gridTemplateColumns: '2fr 3fr 90px 72px',
                alignItems: 'center', padding: '8px 10px',
                backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc',
                borderTop: '1px solid #f1f5f9',
              }}>
                <span style={{ fontWeight: 600, color: '#334155' }}>{c.category}</span>
                <ScoreBar value={c.avgScore} />
                <span style={{ textAlign: 'right', color: '#3D8B36', fontWeight: 600 }}>{fmt(c.pctPositive, 1)}%</span>
                <span style={{ textAlign: 'right', color: '#64748b' }}>{c.totalResponses}</span>
              </div>
            ))}
          </div>

          {/* Gráfica */}
          <div style={{ backgroundColor: '#fafafa', border: '1px solid #f1f5f9', borderRadius: 8, padding: '12px 0 6px 0', overflow: 'visible' }}>
            <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Score promedio por categoría (escala 1–5)
            </div>
            <BarChartSvg categories={byCategory} chartWidth={722} />
          </div>
        </div>
      )}

      {/* ── Diagnóstico: solo hallazgos ── */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0B3C5D', marginBottom: 10, borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
          Diagnóstico
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 7 }}>Hallazgos del período</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {diagnostics.findings.map((f, i) => (
            <li key={i} style={{ fontSize: 11, color: '#475569', marginBottom: 5, lineHeight: 1.5 }}>{f}</li>
          ))}
        </ul>
        {diagnostics.actionPlans.length > 0 && (
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 10, fontStyle: 'italic' }}>
            → Ver planes de acción en la siguiente página.
          </p>
        )}
      </div>

      <PageFooter />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA 2 — Planes de acción
// ══════════════════════════════════════════════════════════════════════════════

function Page2({ data }: { data: ReportData }) {
  const { diagnostics } = data;
  if (!diagnostics.actionPlans.length) return null;

  return (
    <div id="pdf-page-2" style={PAGE}>
      <PageContext data={data} />

      <div style={{ fontSize: 18, fontWeight: 800, color: '#0B3C5D', marginBottom: 6 }}>
        Planes de Acción Recomendados
      </div>
      <p style={{ fontSize: 11, color: '#64748b', marginBottom: 20 }}>
        Las siguientes acciones se recomiendan para las categorías con oportunidad de mejora identificadas en el período.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {diagnostics.actionPlans.map((plan, idx) => (
          <div
            key={plan.category}
            style={{
              gridColumn: diagnostics.actionPlans.length % 2 !== 0 && idx === diagnostics.actionPlans.length - 1
                ? '1 / -1' : undefined,
              borderLeft: '4px solid #dc2626',
              backgroundColor: '#fef9f9',
              borderRadius: '0 8px 8px 0',
              padding: '12px 16px',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 8 }}>{plan.category}</div>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {plan.actions.map((a, i) => (
                <li key={i} style={{ fontSize: 11, color: '#64748b', marginBottom: 5, lineHeight: 1.5 }}>{a}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <PageFooter />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINAS DE DETALLE — agrupadas por tema, máx. 7 preguntas por página
// ══════════════════════════════════════════════════════════════════════════════

const QUESTIONS_PER_PAGE = 5;

type QDetail = NonNullable<ReportData['byQuestion']>[number];

/**
 * Agrupa por tema y luego pagina dentro de cada tema.
 * Garantiza que nunca haya preguntas de temas distintos en la misma página.
 */
function buildQuestionChunks(questions: QDetail[]): QDetail[][] {
  // 1. Agrupar por tema preservando el orden de aparición
  const byTopic = new Map<string, QDetail[]>();
  questions.forEach(q => {
    if (!byTopic.has(q.topicName)) byTopic.set(q.topicName, []);
    byTopic.get(q.topicName)!.push(q);
  });

  // 2. Cada tema se parte en páginas de QUESTIONS_PER_PAGE — nunca se mezclan temas
  const chunks: QDetail[][] = [];
  for (const topicQuestions of byTopic.values()) {
    for (let i = 0; i < topicQuestions.length; i += QUESTIONS_PER_PAGE) {
      chunks.push(topicQuestions.slice(i, i + QUESTIONS_PER_PAGE));
    }
  }
  return chunks;
}

/** Tarjeta de una pregunta — promedio si hay 2+ respuestas, individual si hay 1 */
function QuestionCard({ q }: { q: QDetail }) {
  const count = q.answers.length;
  const avgScore = count > 0
    ? q.answers.reduce((s, a) => s + a.score, 0) / count
    : 0;

  return (
    <div style={{
      border: '1px solid #e2e8f0', borderRadius: 8,
      overflow: 'hidden', marginBottom: 20,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: '#334155',
        backgroundColor: '#f8fafc', padding: '10px 14px',
        borderBottom: '1px solid #e2e8f0', lineHeight: 1.5,
      }}>
        {q.questionText}
      </div>

      {count >= 2 ? (
        /* Múltiples respuestas → mostrar solo promedio */
        <div style={{
          padding: '12px 14px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', fontSize: 11, backgroundColor: '#fff',
        }}>
          <span style={{ color: '#64748b' }}>Promedio de {count} respuestas</span>
          <span style={{
            fontWeight: 700, fontSize: 16,
            color: avgScore >= 4 ? '#3D8B36' : avgScore >= 3 ? '#d97706' : '#dc2626',
          }}>
            {fmt(avgScore)} / 5
          </span>
        </div>
      ) : (
        /* Una sola respuesta → fila individual con fecha */
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9' }}>
              <th style={{ textAlign: 'left',   padding: '8px 14px', color: '#64748b', fontWeight: 600, width: '40%' }}>Fecha</th>
              <th style={{ textAlign: 'center', padding: '8px 14px', color: '#64748b', fontWeight: 600 }}>Calificación</th>
            </tr>
          </thead>
          <tbody>
            {q.answers.map((a, ai) => (
              <tr key={ai} style={{ backgroundColor: ai % 2 === 0 ? '#fff' : '#f8fafc' }}>
                <td style={{ padding: '8px 14px', color: '#475569' }}>{a.fecha}</td>
                <td style={{
                  padding: '8px 14px', textAlign: 'center', fontWeight: 700,
                  color: a.score >= 4 ? '#3D8B36' : a.score >= 3 ? '#d97706' : '#dc2626',
                }}>
                  {a.score} / 5
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/** Una página de detalle — todas las preguntas son del mismo tema */
function QuestionPage({
  data, chunk, pageIdx, totalPages,
}: {
  data: ReportData;
  chunk: QDetail[];
  pageIdx: number;
  totalPages: number;
}) {
  const topicName = chunk[0]?.topicName ?? '';

  return (
    <div id={`pdf-page-q-${pageIdx}`} style={PAGE}>
      <PageContext data={data} />

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#0B3C5D' }}>Detalle por Pregunta</div>
        <div style={{ fontSize: 10, color: '#94a3b8' }}>
          Página {pageIdx + 1} de {totalPages}
        </div>
      </div>

      {/* Encabezado de tema */}
      <div style={{
        fontSize: 13, fontWeight: 700, color: '#2980B9',
        marginBottom: 20, backgroundColor: '#f0f7ff',
        padding: '10px 14px', borderRadius: 6,
        borderLeft: '4px solid #2980B9',
      }}>
        {topicName}
      </div>

      {/* Preguntas de este tema */}
      {chunk.map((q, qi) => <QuestionCard key={qi} q={q} />)}

      <PageFooter />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA FINAL — Comentarios privados
// ══════════════════════════════════════════════════════════════════════════════

function PrivateCommentsPage({ data }: { data: ReportData }) {
  const comments = data.privateComments;
  if (!comments?.length) return null;

  return (
    <div id="pdf-page-comments" style={PAGE}>
      <PageContext data={data} />

      <div style={{ fontSize: 18, fontWeight: 800, color: '#0B3C5D', marginBottom: 6 }}>
        Comentarios Privados
      </div>
      <p style={{ fontSize: 11, color: '#64748b', marginBottom: 20 }}>
        Comentarios adicionales proporcionados por el cliente al completar el formulario. Solo visibles en este reporte.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {comments.map((c, i) => (
          <div key={i} style={{
            borderLeft: '4px solid #2980B9',
            backgroundColor: '#f0f7ff',
            borderRadius: '0 8px 8px 0',
            padding: '12px 16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>
                {c.companyName ?? 'Cliente'}
              </span>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>{c.fecha}</span>
            </div>
            <p style={{ margin: 0, fontSize: 11, color: '#475569', fontStyle: 'italic', lineHeight: 1.6 }}>
              "{c.comment}"
            </p>
          </div>
        ))}
      </div>

      <PageFooter />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Componente raíz — apila las páginas verticalmente fuera del viewport
// ══════════════════════════════════════════════════════════════════════════════

export function PdfReportTemplate({ data }: { data: ReportData }) {
  const chunks = buildQuestionChunks(data.byQuestion ?? []);

  return (
    <div style={{ position: 'absolute', left: -9999, top: 0 }}>
      <Page1 data={data} />
      <Page2 data={data} />
      {chunks.map((chunk, i) => (
        <QuestionPage
          key={i}
          data={data}
          chunk={chunk}
          pageIdx={i}
          totalPages={chunks.length}
        />
      ))}
      <PrivateCommentsPage data={data} />
    </div>
  );
}

/** IDs de páginas que efectivamente tienen contenido, en orden */
export function getPdfPageIds(data: ReportData): string[] {
  const ids = ['pdf-page-1'];
  if (data.diagnostics.actionPlans.length > 0) ids.push('pdf-page-2');
  const totalQPages = buildQuestionChunks(data.byQuestion ?? []).length;
  for (let i = 0; i < totalQPages; i++) ids.push(`pdf-page-q-${i}`);
  if (data.privateComments?.length) ids.push('pdf-page-comments');
  return ids;
}
