export type ReportScope = 'single' | 'multi';
export type StatusLevel = 'ok' | 'warn' | 'bad'; // >= 4.25 | >= 3.5 | < 3.5

export interface ReportMeta {
  generatedAt: string;
  dateFrom: string | null;
  dateTo: string | null;
  scope: ReportScope;
  companyName?: string; // solo single
}

export interface CategoryStat {
  category: string;
  avgScore: number;             // escala 1–5
  totalResponses: number;
  pctPositive: number;
  pctNegative: number;
  dist: [number, number, number, number, number]; // dist_1..5
  status: StatusLevel;
}

export interface QuestionDetail {
  questionText: string;
  topicName: string;
  answers: { fecha: string; score: number; comment: string | null }[];
}

export interface TrendPoint {
  fecha: string;
  avgScore: number;
}

export interface ReportData {
  meta: ReportMeta;
  summary: {
    globalScore: number;        // 1–5
    globalScorePct: number;     // 0–100
    totalResponses: number;
    totalSubmissions: number;
    status: StatusLevel;
  };
  byCategory: CategoryStat[];
  byQuestion?: QuestionDetail[]; // solo single
  trends: TrendPoint[];
  diagnostics: {
    topStrong: CategoryStat[];
    topWeak: CategoryStat[];
    findings: string[];
    actionPlans: { category: string; actions: string[] }[];
  };
}
