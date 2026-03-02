import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export type UserRole = 'superadmin' | 'admin' | 'atencion';

export interface SessionInfo {
  userId: string;
  role: UserRole;
}

/**
 * Obtiene userId + role del usuario autenticado.
 * Retorna null si no hay sesión válida.
 */
export async function getSessionInfo(): Promise<SessionInfo | null> {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile?.role) return null;

  return { userId: user.id, role: profile.role as UserRole };
}

/**
 * Requiere que el usuario esté autenticado con al menos uno de los roles dados.
 * Retorna un NextResponse de error si no cumple, o null si pasa.
 */
export async function requireRole(
  ...roles: UserRole[]
): Promise<{ session: SessionInfo; errorResponse: null } | { session: null; errorResponse: NextResponse }> {
  const session = await getSessionInfo();

  if (!session) {
    return {
      session: null,
      errorResponse: err(401, 'UNAUTHORIZED', 'No autenticado'),
    };
  }

  if (!roles.includes(session.role)) {
    return {
      session: null,
      errorResponse: err(403, 'FORBIDDEN', 'Rol insuficiente'),
    };
  }

  return { session, errorResponse: null };
}

// ── Helpers de respuesta de error ────────────────────────────────────────────

export function err(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json({ error: code, message, ...(details ? { details } : {}) }, { status });
}

export const unauthorized = (msg = 'No autenticado') =>
  err(401, 'UNAUTHORIZED', msg);

export const forbidden = (msg = 'Acceso denegado') =>
  err(403, 'FORBIDDEN', msg);

export const badRequest = (msg: string, details?: unknown) =>
  err(400, 'BAD_REQUEST', msg, details);

export const serverError = (msg = 'Error interno del servidor') =>
  err(500, 'SERVER_ERROR', msg);
