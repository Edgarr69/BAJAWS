/**
 * GET  /api/admin/users → listar todos los perfiles internos
 * POST /api/admin/users → crear nuevo usuario (superadmin y admin)
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, badRequest, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET() {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('profiles')
    .select('id, email, full_name, role, created_at, updated_at')
    .order('created_at');

  if (error) return serverError(error.message);
  return NextResponse.json(data);
}

const createSchema = z.object({
  email:     z.string().email('Email inválido'),
  password:  z.string().min(8, 'Mínimo 8 caracteres').max(72, 'Máximo 72 caracteres'),
  full_name: z.string().max(80).optional(),
  role:      z.enum(['admin', 'atencion', 'pending']).default('atencion'),
});

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  // Rate limit: máximo 10 creaciones de usuario por hora por actor
  const rl = checkRateLimit(`user-create:${session.userId}`, 10, 3600_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'RATE_LIMIT', message: 'Demasiadas creaciones de usuario. Intenta más tarde.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest('Datos inválidos', parsed.error.flatten());

  const { email, password, full_name, role } = parsed.data;

  // Admin no puede crear usuarios con rol admin
  if (session.role === 'admin' && role === 'admin') {
    return NextResponse.json(
      { error: 'FORBIDDEN', message: 'Solo el superadmin puede crear administradores' },
      { status: 403 }
    );
  }

  const admin = getAdminClient();

  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) return serverError(createError.message);

  await admin.from('profiles').upsert({
    id:        newUser.user.id,
    email,
    full_name: full_name?.trim() || null,
    role,
  });

  return NextResponse.json({ ok: true, id: newUser.user.id }, { status: 201 });
}
