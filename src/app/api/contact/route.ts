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
  // CSRF: rechazar requests cross-origin (solo permite POST desde el mismo host)
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (!origin) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }
  try {
    if (new URL(origin).host !== host) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  // x-real-ip lo fija Vercel/CDN — no puede ser falsificado por el cliente
  // x-forwarded-for puede inyectarse; usar último valor como fallback
  const ip = req.headers.get('x-real-ip')
           ?? req.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim()
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

  // Honeypot: si el campo oculto trae valor, es un bot. Devolvemos 201 ok
  // para no revelar que detectamos el honeypot, pero no insertamos nada.
  if (body && typeof body === 'object' && 'hp' in body && body.hp) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID' }, { status: 400 });
  }

  const { nombre, telefono, correo, mensaje, fuente } = parsed.data;

  const secret = process.env.IP_HASH_SECRET;
  if (!secret) {
    console.error('IP_HASH_SECRET no está configurado');
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
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
