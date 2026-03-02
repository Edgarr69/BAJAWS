/**
 * POST /api/contact
 * Endpoint público: recibe mensajes del formulario de contacto y cotización.
 * No requiere autenticación — rate-limited por IP.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash } from 'crypto';
import { getAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';

const schema = z.object({
  nombre:   z.string().trim().min(2).max(80),
  telefono: z.string().trim().max(20).optional().or(z.literal('')),
  correo:   z.string().trim().email().max(120),
  mensaje:  z.string().trim().min(10).max(1000),
  fuente:   z.enum(['contacto', 'cotizacion']).default('contacto'),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
           ?? req.headers.get('x-real-ip')
           ?? 'unknown';

  // Rate limit: 3 envíos por IP cada 10 minutos
  const rl = checkRateLimit(`contact:${ip}`, 3, 600_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'RATE_LIMIT', message: 'Demasiados envíos. Intenta más tarde.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  const body   = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID' }, { status: 400 });
  }

  const { nombre, telefono, correo, mensaje, fuente } = parsed.data;

  const secret = process.env.IP_HASH_SECRET ?? 'bajaws-fallback';
  const ipHash = createHash('sha256').update(ip + secret).digest('hex');

  const admin = getAdminClient();
  const { error } = await admin.from('contact_requests').insert({
    nombre,
    telefono: telefono || null,
    correo,
    mensaje,
    fuente,
    ip_hash: ipHash,
  });

  if (error) {
    console.error('contact insert:', error.message);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
