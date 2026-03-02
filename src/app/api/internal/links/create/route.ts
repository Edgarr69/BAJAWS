/**
 * POST /api/internal/links/create
 * Genera un enlace corto de evaluación.
 * Roles: admin (TTL 900–86400s) | atencion (TTL fijo 3600s)
 *
 * Body: { service_id?: string (uuid), ttl_seconds?: number }
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, badRequest, forbidden, serverError } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  service_id:  z.string().uuid().optional(),
  ttl_seconds: z.number().int().min(900).max(86400).default(3600),
});

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireRole('superadmin', 'admin', 'atencion');
  if (errorResponse) return errorResponse;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest('Payload inválido', parsed.error.flatten());

  const { service_id, ttl_seconds } = parsed.data;

  // Atencion no puede cambiar el TTL (doble validación: también en RPC)
  if (session.role === 'atencion' && ttl_seconds !== 3600) {
    return forbidden('El rol atencion solo puede usar TTL de 3600 segundos');
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('create_feedback_link', {
    p_service_id:  service_id ?? null,
    p_ttl_seconds: ttl_seconds,
  });

  if (error) return serverError(error.message);

  if (data?.error) {
    const statusMap: Record<string, number> = {
      UNAUTHORIZED:    401,
      FORBIDDEN:       403,
      INVALID_TTL:     400,
      NO_FORM_VERSION: 409,
      CODE_COLLISION:  500,
    };
    return NextResponse.json(data, { status: statusMap[data.error] ?? 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
