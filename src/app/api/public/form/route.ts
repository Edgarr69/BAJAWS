/**
 * GET /api/public/form?code=XXXXXXXX
 * Endpoint público: retorna preguntas activas del formulario.
 * No requiere autenticación. No expone datos sensibles.
 *
 * Rate limit: 30 req/min por IP.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateShortCode } from '@/utils/shortcode';

export async function GET(req: NextRequest) {
  // Rate limiting por IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rl = checkRateLimit(`form:${ip}`, 30, 60_000);

  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'RATE_LIMIT', message: 'Demasiadas solicitudes. Intenta en un momento.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  const code = req.nextUrl.searchParams.get('code')?.toUpperCase().trim() ?? '';

  if (!validateShortCode(code)) {
    return NextResponse.json(
      { error: 'INVALID', message: 'Código de formulario inválido (debe ser 8 caracteres)' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_public_form', { p_code: code });

  if (error) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: error.message }, { status: 500 });
  }

  if (data?.error) {
    const statusMap: Record<string, number> = {
      INVALID:  404,
      EXPIRED:  410,
      USED:     409,
      BLOCKED:  403,
    };
    return NextResponse.json(data, { status: statusMap[data.error] ?? 400 });
  }

  // Cabeceras: sin caché (el form puede expirar en cualquier momento)
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
