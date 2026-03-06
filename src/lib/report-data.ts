'use client';

import { getMetrics, getSubmissions, getSubmission } from '@/lib/api';
import type { AggregateMetric } from '@/types/panel';
import type {
  ReportData, ReportScope, StatusLevel,
  CategoryStat, QuestionDetail, TrendPoint, PrivateComment,
} from '@/types/report';

// ── Helpers ──────────────────────────────────────────────────────────────────

function scoreStatus(avg: number): StatusLevel {
  if (avg >= 4.25) return 'ok';
  if (avg >= 3.5)  return 'warn';
  return 'bad';
}

const ACTION_PLANS: Record<string, string[]> = {
  'Calidad': [
    'Auditar proceso de tratamiento y verificar parámetros de efluente.',
    'Implementar revisiones de calidad semanales con el equipo técnico.',
    'Solicitar retroalimentación específica al cliente sobre los puntos de mejora.',
  ],
  'Presentación': [
    'Revisar protocolo de presentación de informes al cliente.',
    'Capacitar al personal en comunicación profesional y uniforme.',
    'Establecer checklist de entrega de servicio antes de salida del equipo.',
  ],
  'Facturación': [
    'Revisar proceso de emisión y entrega de facturas.',
    'Capacitar al área administrativa en tiempos de respuesta.',
    'Implementar confirmación de recepción de factura con el cliente.',
  ],
  'Precios': [
    'Realizar análisis comparativo de mercado para validar tarifas.',
    'Preparar material explicativo del valor diferenciado del servicio.',
    'Revisar si los costos adicionales se están comunicando con claridad.',
  ],
  'Atención': [
    'Reforzar capacitación en atención al cliente para todo el personal.',
    'Implementar protocolo de seguimiento post-servicio.',
    'Establecer tiempo máximo de respuesta a solicitudes del cliente.',
  ],
};

function getActionPlan(category: string): string[] {
  // Busca coincidencia parcial con las categorías conocidas
  const key = Object.keys(ACTION_PLANS).find(k =>
    category.toLowerCase().includes(k.toLowerCase())
  );
  return key ? ACTION_PLANS[key] : [
    'Revisar el proceso actual e identificar áreas de mejora.',
    'Solicitar retroalimentación específica del cliente sobre esta categoría.',
    'Establecer indicadores de seguimiento para el próximo período.',
  ];
}

function buildDiagnostics(byCategory: CategoryStat[], trends: TrendPoint[]) {
  const sorted = [...byCategory].sort((a, b) => b.avgScore - a.avgScore);
  const topStrong = sorted.slice(0, 3).filter(c => c.status !== 'bad');
  const topWeak   = [...sorted].reverse().slice(0, 3).filter(c => c.status !== 'ok');

  const findings: string[] = [];
  const totalResp = byCategory.reduce((s, c) => s + c.totalResponses, 0);
  if (totalResp === 0) {
    findings.push('No hay respuestas en el período seleccionado.');
    return { topStrong, topWeak, findings, actionPlans: [] };
  }

  const globalAvg = byCategory.reduce((s, c) => s + c.avgScore * c.totalResponses, 0) / totalResp;
  findings.push(`Score global ponderado: ${globalAvg.toFixed(2)} / 5.00 (${scoreStatus(globalAvg) === 'ok' ? 'satisfactorio' : scoreStatus(globalAvg) === 'warn' ? 'en atención' : 'requiere mejora'}).`);

  if (topStrong.length) {
    findings.push(`Puntos fuertes: ${topStrong.map(c => c.category).join(', ')}.`);
  }
  if (topWeak.length) {
    findings.push(`Áreas de oportunidad: ${topWeak.map(c => c.category).join(', ')}.`);
  }

  const avgPctPositive = byCategory.reduce((s, c) => s + c.pctPositive * c.totalResponses, 0) / totalResp;
  findings.push(`${avgPctPositive.toFixed(1)}% de las respuestas son positivas (calificación 4 o 5).`);

  if (trends.length >= 2) {
    const first = trends[0].avgScore;
    const last  = trends[trends.length - 1].avgScore;
    const delta = last - first;
    if (Math.abs(delta) > 0.1) {
      findings.push(`Tendencia del período: score ${delta > 0 ? 'en alza' : 'a la baja'} (${delta > 0 ? '+' : ''}${delta.toFixed(2)} puntos).`);
    } else {
      findings.push('Tendencia estable durante el período.');
    }
  }

  const actionPlans = topWeak.map(cat => ({
    category: cat.category,
    actions: getActionPlan(cat.category),
  }));

  return { topStrong, topWeak, findings, actionPlans };
}

// ── Tipos auxiliares de API ───────────────────────────────────────────────────

interface SubmissionRow {
  id: string;
  submitted_at: string;
  company_name: string | null;
  feedback_links?: { code: string } | null;
  services?: { folio: string | null; service_date: string | null } | null;
}

interface AnswerRow {
  id: string;
  value_int: number;
  value_text: string | null;
  questions?: {
    id: number;
    text: string;
    display_order: number;
    topics?: { name: string; display_order: number } | null;
  } | null;
}

interface SubmissionDetail {
  submission: {
    id: string;
    submitted_at: string;
    private_comment?: string | null;
    feedback_links?: { code: string } | null;
    services?: { folio: string | null; service_date: string | null } | null;
  };
  answers: AnswerRow[];
}

// ── Flujo multi ───────────────────────────────────────────────────────────────

async function buildMultiReport(
  dateFrom: string | null,
  dateTo: string | null,
): Promise<ReportData> {
  const params: Record<string, string> = {};
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo)   params.date_to   = dateTo;

  const [topicRes, trendRes] = await Promise.all([
    getMetrics({ ...params, group_by: 'topic' }),
    getMetrics({ ...params, group_by: 'day'   }),
  ]);

  const topicRaw  = topicRes.data ?? [];
  const trendRaw  = trendRes.data ?? [];

  const byCategory: CategoryStat[] = topicRaw.map(d => ({
    category:       d.topic ?? 'Sin categoría',
    avgScore:       d.avg_score,
    totalResponses: d.total_responses,
    pctPositive:    d.pct_positive,
    pctNegative:    d.pct_negative,
    dist: [d.dist_1 ?? 0, d.dist_2 ?? 0, d.dist_3 ?? 0, d.dist_4 ?? 0, d.dist_5 ?? 0],
    status: scoreStatus(d.avg_score),
  }));

  const trends: TrendPoint[] = trendRaw.map(d => ({
    fecha:    d.date ?? d.week_start ?? '',
    avgScore: d.avg_score_global ?? d.avg_score,
  }));

  const totalResponses  = byCategory.reduce((s, c) => s + c.totalResponses, 0);
  const totalSubmissions = trendRaw.reduce((s, d) => s + (d.total_submissions ?? 1), 0);
  const globalScore = totalResponses
    ? byCategory.reduce((s, c) => s + c.avgScore * c.totalResponses, 0) / totalResponses
    : 0;

  const diagnostics = buildDiagnostics(byCategory, trends);

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      dateFrom,
      dateTo,
      scope: 'multi',
    },
    summary: {
      globalScore,
      globalScorePct: ((globalScore - 1) / 4) * 100,
      totalResponses,
      totalSubmissions,
      status: scoreStatus(globalScore),
    },
    byCategory,
    trends,
    diagnostics,
  };
}

// ── Flujo single ──────────────────────────────────────────────────────────────

async function buildSingleReport(
  companyName: string,
  dateFrom: string | null,
  dateTo: string | null,
): Promise<ReportData> {
  const params: Record<string, string> = {};
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo)   params.date_to   = dateTo;

  const allSubs = await getSubmissions(Object.keys(params).length ? params : undefined) as SubmissionRow[];
  const filtered = allSubs.filter(s =>
    s.company_name?.toLowerCase() === companyName.toLowerCase()
  );

  if (filtered.length === 0) {
    return {
      meta: { generatedAt: new Date().toISOString(), dateFrom, dateTo, scope: 'single', companyName },
      summary: { globalScore: 0, globalScorePct: 0, totalResponses: 0, totalSubmissions: 0, status: 'bad' },
      byCategory: [],
      byQuestion: [],
      trends: [],
      diagnostics: { topStrong: [], topWeak: [], findings: ['No hay evaluaciones para esta empresa en el período.'], actionPlans: [] },
    };
  }

  const details = await Promise.all(
    filtered.map(s => getSubmission(s.id) as Promise<SubmissionDetail>)
  );

  // Acumular por topic y por question
  const byCategoryMap = new Map<string, { sum: number; count: number; d: [number,number,number,number,number] }>();
  const byQuestionMap = new Map<number, { text: string; topic: string; answers: { fecha: string; score: number }[] }>();
  const privateComments: PrivateComment[] = [];

  const trends: TrendPoint[] = [];

  details.forEach((detail, idx) => {
    const fecha = filtered[idx].submitted_at.slice(0, 10);
    const subAnswers = detail.answers ?? [];

    // Comentario privado a nivel de submission
    const pc = detail.submission?.private_comment?.trim();
    if (pc) {
      privateComments.push({
        fecha,
        companyName: filtered[idx].company_name ?? undefined,
        comment: pc,
      });
    }

    let subSum = 0;
    subAnswers.forEach(a => {
      const score = a.value_int;
      subSum += score;

      const topic    = a.questions?.topics?.name ?? 'Sin categoría';
      const qId      = a.questions?.id ?? -1;
      const qText    = a.questions?.text ?? '';

      // byCategory
      if (!byCategoryMap.has(topic)) {
        byCategoryMap.set(topic, { sum: 0, count: 0, d: [0,0,0,0,0] });
      }
      const cat = byCategoryMap.get(topic)!;
      cat.sum   += score;
      cat.count += 1;
      if (score >= 1 && score <= 5) cat.d[score - 1]++;

      // byQuestion
      if (!byQuestionMap.has(qId)) {
        byQuestionMap.set(qId, { text: qText, topic, answers: [] });
      }
      byQuestionMap.get(qId)!.answers.push({ fecha, score });
    });

    if (subAnswers.length > 0) {
      trends.push({ fecha, avgScore: subSum / subAnswers.length });
    }
  });

  const byCategory: CategoryStat[] = Array.from(byCategoryMap.entries()).map(([category, v]) => {
    const avg        = v.sum / v.count;
    const pos        = (v.d[3] + v.d[4]) / v.count;
    const neg        = (v.d[0] + v.d[1]) / v.count;
    return {
      category,
      avgScore:       avg,
      totalResponses: v.count,
      pctPositive:    pos * 100,
      pctNegative:    neg * 100,
      dist:           v.d,
      status:         scoreStatus(avg),
    };
  });

  const byQuestion: QuestionDetail[] = Array.from(byQuestionMap.values()).map(q => ({
    questionText: q.text,
    topicName:    q.topic,
    answers:      q.answers,
  }));

  const totalResponses = byCategory.reduce((s, c) => s + c.totalResponses, 0);
  const globalScore    = totalResponses
    ? byCategory.reduce((s, c) => s + c.avgScore * c.totalResponses, 0) / totalResponses
    : 0;

  const diagnostics = buildDiagnostics(byCategory, trends);

  return {
    meta: { generatedAt: new Date().toISOString(), dateFrom, dateTo, scope: 'single', companyName },
    summary: {
      globalScore,
      globalScorePct: ((globalScore - 1) / 4) * 100,
      totalResponses,
      totalSubmissions: filtered.length,
      status: scoreStatus(globalScore),
    },
    byCategory,
    byQuestion,
    privateComments: privateComments.length ? privateComments : undefined,
    trends,
    diagnostics,
  };
}

// ── Punto de entrada público ──────────────────────────────────────────────────

export async function buildReportData(filters: {
  companyName?: string;
  dateFrom: string | null;
  dateTo: string | null;
}): Promise<ReportData> {
  const { companyName, dateFrom, dateTo } = filters;
  if (companyName) {
    return buildSingleReport(companyName, dateFrom, dateTo);
  }
  return buildMultiReport(dateFrom, dateTo);
}
