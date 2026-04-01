export type UserRole = 'superadmin' | 'admin' | 'atencion' | 'pending';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
}

export interface Topic {
  id: number;
  name: string;
  display_order: number;
}

export interface Question {
  id: number;
  topic_id: number;
  text: string;
  type: string;
  is_active: boolean;
  display_order: number;
  topics?: { name: string };
}

export interface FeedbackLink {
  id: string;
  code: string;
  service_id: string | null;
  expires_at: string;
  used_at: string | null;
  blocked_at: string | null;
  attempts: number;
  max_attempts: number;
  ttl_seconds: number;
  created_at: string;
  created_by: string;
  services?: { folio: string | null; service_date: string | null } | null;
}

export interface Submission {
  id: string;
  submitted_at: string;
  company_name: string | null;
  feedback_links?: { code: string } | null;
  services?: { folio: string | null; service_date: string | null } | null;
}

export interface Answer {
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

export interface AggregateMetric {
  topic?: string;
  question_id?: number;
  question_text?: string;
  avg_score: number;
  total_responses: number;
  pct_positive: number;
  pct_negative: number;
  dist_1?: number;
  dist_2?: number;
  dist_3?: number;
  dist_4?: number;
  dist_5?: number;
  date?: string;
  week_start?: string;
  avg_score_global?: number;
  total_submissions?: number;
}

export interface AggregateResponse {
  ok: boolean;
  group_by: string;
  date_from: string | null;
  date_to: string | null;
  data: AggregateMetric[];
}

export interface ContactRequest {
  id: string;
  nombre: string;
  telefono: string | null;
  correo: string;
  mensaje: string;
  fuente: 'contacto' | 'cotizacion';
  created_at: string;
}

export interface Autorizacion {
  id: string;
  clasificacion: string;
  dependencia: string;
  modalidad: string;
  residuo: string;
  numero_autorizacion: string;
  vigencia: string;
  display_order: number;
  created_at: string;
}

export type LinkStatus = 'vigente' | 'usado' | 'expirado' | 'bloqueado';

export function getLinkStatus(link: FeedbackLink): LinkStatus {
  if (link.blocked_at) return 'bloqueado';
  if (link.used_at)    return 'usado';
  if (new Date(link.expires_at) < new Date()) return 'expirado';
  return 'vigente';
}
