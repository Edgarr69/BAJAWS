/**
 * Cliente API para el panel interno.
 * Todas las funciones usan fetch con credentials: 'include' para que las cookies
 * de sesión de Supabase se envíen automáticamente.
 */
import { z } from 'zod';
import type { Question } from '@/types/panel';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...options });
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Error ${res.status}${res.statusText ? ': ' + res.statusText : ''}`);
  }
  if (!res.ok) throw new Error((data as Record<string, string>)?.message ?? 'Error de servidor');
  return data as T;
}

// ── Schemas de Zod ───────────────────────────────────────────────────────────
// Supabase devuelve las relaciones anidadas como objeto (FK simple) o array
// (FK múltiple). Los selects usados aquí son to-one, así que lo normal es un
// objeto, pero dejamos el array opcional para tolerar ambos casos.
const nestedOneToOne = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([schema, z.array(schema)]).nullable().optional();

export const LinkSchema = z.object({
  id:           z.string().uuid(),
  code:         z.string(),
  service_id:   z.string().uuid().nullable(),
  expires_at:   z.string(),
  used_at:      z.string().nullable(),
  blocked_at:   z.string().nullable(),
  attempts:     z.number(),
  max_attempts: z.number(),
  ttl_seconds:  z.number(),
  created_at:   z.string(),
  created_by:   z.string().uuid(),
  services: nestedOneToOne(z.object({
    service_date: z.string().nullable(),
  })),
});

export const QuestionSchema = z.object({
  id:            z.number(),
  topic_id:      z.number(),
  text:          z.string(),
  type:          z.string(),
  is_active:     z.boolean(),
  display_order: z.number(),
  topics: nestedOneToOne(z.object({ name: z.string() })),
});

export const UserSchema = z.object({
  id:         z.string().uuid(),
  email:      z.string(),
  full_name:  z.string().nullable(),
  role:       z.enum(['superadmin', 'admin', 'atencion', 'pending']),
  created_at: z.string().optional(),
  updated_at: z.string().optional().nullable(),
});

export type LinkDTO     = z.infer<typeof LinkSchema>;
export type QuestionDTO = z.infer<typeof QuestionSchema>;
export type UserDTO     = z.infer<typeof UserSchema>;

async function apiFetchArray<T extends z.ZodTypeAny>(
  url: string,
  schema: T,
): Promise<z.infer<T>[]> {
  const raw = await apiFetch<unknown>(url);
  return z.array(schema).parse(raw);
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const getMe = () =>
  apiFetch<{ id: string; email: string; full_name: string; role: string }>('/api/me');

// ── Métricas ─────────────────────────────────────────────────────────────────
export const getMetrics = (params: Record<string, string>) => {
  const filtered = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''));
  const qs = new URLSearchParams(filtered).toString();
  return apiFetch<AggregateResponse>(`/api/internal/metrics/aggregate?${qs}`);
};

// ── Enlaces ──────────────────────────────────────────────────────────────────
export const getLinks = () => apiFetchArray('/api/internal/links', LinkSchema);

export const getLinkStats = async (params: { date_from: string; date_to: string }) => {
  const p: Record<string, string> = { _stats: '1' };
  if (params.date_from) p.date_from = params.date_from;
  if (params.date_to)   p.date_to   = params.date_to;
  const links = await apiFetch<{ used_at: string | null }[]>(`/api/internal/links?${new URLSearchParams(p).toString()}`);
  const total = links.length;
  const used  = links.filter(l => l.used_at !== null).length;
  const pct   = total > 0 ? Math.round((used / total) * 100) : 0;
  return { total, used, pct };
};

export const createService = (body: { folio?: string; service_date?: string; notes?: string }) =>
  apiFetch<{ ok: boolean; service: { id: string } }>('/api/internal/services/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const createLink = (body: { service_id?: string; ttl_seconds?: number }) =>
  apiFetch<{ ok: boolean; code: string; url: string; expires_at: string }>('/api/internal/links/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

// ── Submissions ───────────────────────────────────────────────────────────────
import type { Submission, Answer, AggregateResponse } from '@/types/panel';

export const getSubmissions = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch<Submission[]>(`/api/internal/submissions${qs}`);
};

export const getSubmission = (id: string) =>
  apiFetch<{ submission: Submission; answers: Answer[] }>(`/api/internal/submissions/${id}`);

export const deleteSubmission = (id: string) =>
  apiFetch<{ ok: boolean }>(`/api/internal/submissions/${id}`, { method: 'DELETE' });

// ── Preguntas ─────────────────────────────────────────────────────────────────
export const getQuestions = () => apiFetchArray('/api/admin/questions', QuestionSchema);

export const createQuestion = (body: { topic_id: number; text: string; type?: 'likert' | 'open' | 'yesno'; display_order?: number }) =>
  apiFetch<Question>('/api/admin/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const updateQuestion = (id: number, body: Partial<{ text: string; is_active: boolean; display_order: number; topic_id: number }>) =>
  apiFetch<{ ok: boolean }>(`/api/admin/questions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const deleteQuestion = (id: number) =>
  apiFetch<{ ok: boolean }>(`/api/admin/questions/${id}`, { method: 'DELETE' });

// ── Usuarios ──────────────────────────────────────────────────────────────────
export const getUsers = () => apiFetchArray('/api/admin/users', UserSchema);

export const createUser = (body: { email: string; password: string; full_name?: string; role: 'admin' | 'atencion' | 'pending' }) =>
  apiFetch<{ ok: boolean; id: string }>('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const setUserRole = (user_id: string, role: 'admin' | 'atencion') =>
  apiFetch<{ ok: boolean }>('/api/admin/users/set-role', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, role }),
  });

export const updateUserName = (user_id: string, full_name: string) =>
  apiFetch<{ ok: boolean }>(`/api/admin/users/${user_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name }),
  });

export const deleteUser = (user_id: string) =>
  apiFetch<{ ok: boolean }>(`/api/admin/users/${user_id}`, { method: 'DELETE' });

// ── Contactos ─────────────────────────────────────────────────────────────────
export const getContactos = () =>
  apiFetch<{ id: string; nombre: string; telefono: string | null; correo: string; mensaje: string; fuente: string; created_at: string }[]>('/api/internal/contactos');

export const deleteContacto = (id: string) =>
  apiFetch<{ ok: boolean }>(`/api/internal/contactos?id=${id}`, { method: 'DELETE' });

// ── Autorizaciones ────────────────────────────────────────────────────────────
import type { Autorizacion } from '@/types/panel';

export const getAutorizaciones = () =>
  apiFetch<Autorizacion[]>('/api/admin/autorizaciones');

export const createAutorizacion = (body: Omit<Autorizacion, 'id' | 'created_at'>) =>
  apiFetch<Autorizacion>('/api/admin/autorizaciones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const updateAutorizacion = (id: string, body: Partial<Omit<Autorizacion, 'id' | 'created_at'>>) =>
  apiFetch<Autorizacion>(`/api/admin/autorizaciones/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const deleteAutorizacion = (id: string) =>
  apiFetch<{ ok: boolean }>(`/api/admin/autorizaciones/${id}`, { method: 'DELETE' });

// ── Exportaciones ─────────────────────────────────────────────────────────────
export const getRawAnswers = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch<{ ok: boolean; data: unknown[] }>(`/api/internal/answers/raw${qs}`);
};

// ── Reset ─────────────────────────────────────────────────────────────────────
export const resetAllData = () =>
  apiFetch<{ ok: boolean }>('/api/admin/reset-all?confirm=RESET_ALL', { method: 'DELETE' });

export const deleteLinkByCode = (code: string) =>
  apiFetch<{ ok: boolean }>(`/api/admin/reset-all?code=${encodeURIComponent(code)}`, { method: 'DELETE' });

// ── Correos de notificación ───────────────────────────────────────────────────
export interface NotificationEmail {
  id: string;
  email: string;
  label: string | null;
  is_active: boolean;
  notify_postulantes: boolean;
  created_at: string;
}

export const getNotificationEmails = () =>
  apiFetch<NotificationEmail[]>('/api/admin/notification-emails');

export const createNotificationEmail = (body: { email: string; label?: string; is_active?: boolean; notify_postulantes?: boolean }) =>
  apiFetch<NotificationEmail>('/api/admin/notification-emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const toggleNotificationEmail = (id: string, is_active: boolean) =>
  apiFetch<NotificationEmail>(`/api/admin/notification-emails/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_active }),
  });

export const toggleNotificationPostulantes = (id: string, notify_postulantes: boolean) =>
  apiFetch<NotificationEmail>(`/api/admin/notification-emails/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notify_postulantes }),
  });

export const deleteNotificationEmail = (id: string) =>
  apiFetch<{ ok: boolean }>(`/api/admin/notification-emails/${id}`, {
    method: 'DELETE',
  });

// ── Vacantes ──────────────────────────────────────────────────────────────────
import type { JobPosting, JobApplication } from '@/types/panel';

export const getJobPostings = () =>
  apiFetch<JobPosting[]>('/api/admin/job-postings');

export const createJobPosting = (body: Omit<JobPosting, 'id' | 'created_by' | 'created_at' | 'updated_at'>) =>
  apiFetch<JobPosting>('/api/admin/job-postings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const toggleJobPosting = (id: string, is_active: boolean) =>
  apiFetch<JobPosting>(`/api/admin/job-postings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_active }),
  });

export const deleteJobPosting = (id: string) =>
  apiFetch<{ ok: boolean }>(`/api/admin/job-postings/${id}`, { method: 'DELETE' });

// ── Postulaciones ─────────────────────────────────────────────────────────────

export const getJobApplications = (params?: { posting_id?: string }) => {
  const qs = params?.posting_id ? `?posting_id=${params.posting_id}` : '';
  return apiFetch<JobApplication[]>(`/api/admin/job-applications${qs}`);
};

export const deleteJobApplication = (id: string) =>
  apiFetch<{ ok: boolean }>(`/api/admin/job-applications/${id}`, { method: 'DELETE' });

export const getJobApplicationCvUrl = (id: string) =>
  apiFetch<{ url: string }>(`/api/admin/job-applications/${id}/cv`);
