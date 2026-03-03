/**
 * Cliente API para el panel interno.
 * Todas las funciones usan fetch con credentials: 'include' para que las cookies
 * de sesión de Supabase se envíen automáticamente.
 */

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? 'Error de servidor');
  return data as T;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const getMe = () =>
  apiFetch<{ id: string; email: string; full_name: string; role: string }>('/api/me');

// ── Métricas ─────────────────────────────────────────────────────────────────
export const getMetrics = (params: Record<string, string>) => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch<AggregateResponse>(`/api/internal/metrics/aggregate?${qs}`);
};

// ── Enlaces ──────────────────────────────────────────────────────────────────
export const getLinks = () => apiFetch<unknown[]>('/api/internal/links');

export const getLinkStats = async (params: { date_from: string; date_to: string }) => {
  const qs = new URLSearchParams({ ...params, _stats: '1' }).toString();
  const links = await apiFetch<{ used_at: string | null }[]>(`/api/internal/links?${qs}`);
  const total = links.length;
  const used  = links.filter(l => l.used_at != null).length;
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

// ── Preguntas ─────────────────────────────────────────────────────────────────
export const getQuestions = () => apiFetch<unknown[]>('/api/admin/questions');

export const createQuestion = (body: { topic_id: number; text: string; display_order?: number }) =>
  apiFetch<unknown>('/api/admin/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const updateQuestion = (id: number, body: Partial<{ text: string; is_active: boolean; display_order: number; topic_id: number }>) =>
  apiFetch<unknown>(`/api/admin/questions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const deleteQuestion = (id: number) =>
  apiFetch<{ ok: boolean }>(`/api/admin/questions/${id}`, { method: 'DELETE' });

// ── Usuarios ──────────────────────────────────────────────────────────────────
export const getUsers = () => apiFetch<unknown[]>('/api/admin/users');

export const setUserRole = (user_id: string, role: 'admin' | 'atencion') =>
  apiFetch<{ ok: boolean }>('/api/admin/users/set-role', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, role }),
  });

// ── Solicitudes de acceso ─────────────────────────────────────
export const getSolicitudes = () => apiFetch<{ id: string; email: string; full_name: string; created_at: string }[]>('/api/internal/solicitudes');

export const procesarSolicitud = (user_id: string, action: 'aprobar' | 'rechazar') =>
  apiFetch<{ ok: boolean; action: string; email: string }>('/api/internal/solicitudes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, action }),
  });

// ── Contactos ─────────────────────────────────────────────────────────────────
export const getContactos = () =>
  apiFetch<{ id: string; nombre: string; telefono: string | null; correo: string; mensaje: string; fuente: string; created_at: string }[]>('/api/internal/contactos');

export const deleteContacto = (id: string) =>
  apiFetch<{ ok: boolean }>(`/api/internal/contactos?id=${id}`, { method: 'DELETE' });

// ── Exportaciones ─────────────────────────────────────────────────────────────
export const getRawAnswers = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch<{ ok: boolean; data: unknown[] }>(`/api/internal/answers/raw${qs}`);
};
