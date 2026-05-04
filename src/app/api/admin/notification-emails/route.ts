/**
 * GET  /api/admin/notification-emails  → listar todos los emails de notificación
 * POST /api/admin/notification-emails  → crear nuevo email { email, label }
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, badRequest, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

const createSchema = z.object({
  email: z.string().email('Email inválido').max(254),
  label: z.string().min(1, 'El label es requerido').max(100),
});

export async function GET() {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('notification_emails')
    .select('id, email, label, is_active, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[admin/notification-emails GET] list failed:', error);
    return serverError('No se pudieron obtener los emails de notificación');
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireRole('superadmin', 'admin');
  if (errorResponse) return errorResponse;

  const body = await req.json().catch((err: unknown) => {
    console.error('[admin/notification-emails POST] error al parsear JSON del body:', err);
    return null;
  });
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest('Payload inválido', parsed.error.flatten());

  const admin = getAdminClient();

  // Verificar unicidad del email
  const { data: existing, error: checkError } = await admin
    .from('notification_emails')
    .select('id')
    .eq('email', parsed.data.email)
    .maybeSingle();

  if (checkError) {
    console.error('[admin/notification-emails POST] check duplicado failed:', checkError);
    return serverError('Error al verificar duplicados');
  }
  if (existing) return badRequest('El email ya está registrado');

  const { data, error } = await admin
    .from('notification_emails')
    .insert({ email: parsed.data.email, label: parsed.data.label })
    .select()
    .single();

  if (error) {
    console.error('[admin/notification-emails POST] insert failed:', error);
    return serverError('No se pudo crear el email de notificación');
  }
  return NextResponse.json(data, { status: 201 });
}
