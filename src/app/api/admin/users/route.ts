/**
 * GET /api/admin/users → listar todos los perfiles internos
 */
import { NextResponse } from 'next/server';
import { requireRole, serverError } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

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
