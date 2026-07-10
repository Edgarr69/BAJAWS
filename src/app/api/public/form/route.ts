/**
 * GET /api/public/form?code=XXXXXXXX
 * Endpoint público: retorna preguntas activas del formulario.
 * No requiere autenticación. No expone datos sensibles.
 *
 * Rate limit: 30 req/min por IP.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateShortCode } from '@/utils/shortcode';
import { getHashedIp } from '@/lib/request-utils';

export async function GET(req: NextRequest) {
  // Rate limiting por IP hasheada (consistente con el resto de endpoints)
  let ipHash: string;
  try {
    ipHash = getHashedIp(req);
  } catch {
    console.error('IP_HASH_SECRET no está configurado');
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
  const rl = await checkRateLimit(`form:${ipHash}`, 30, 60_000);

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

  // Service role: el visitante no tiene sesión y el RPC no depende de auth.uid().
  // Permite revocar EXECUTE de anon/authenticated y cerrar el acceso directo vía PostgREST.
  const supabase = getAdminClient();
  const { data, error } = await supabase.rpc('get_public_form', { p_code: code });

  if (error) {
    console.error('get_public_form RPC error:', error.message);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }

  if (data?.error) {
    // Anti-enumeración: unificar respuestas de INVALID/EXPIRED/USED bajo un mismo
    // status 404 y mensaje genérico, para impedir que un atacante deduzca si un
    // código existió alguna vez. El estado real se conserva en logs server-side.
    const enumerableStates = new Set(['INVALID', 'EXPIRED', 'USED']);

    if (enumerableStates.has(data.error)) {
      console.warn('[public/form] estado:', data.error);
      return NextResponse.json(
        { error: 'INVALID', message: 'Código inválido o ya utilizado' },
        { status: 404 }
      );
    }

    // Otros estados (p. ej. BLOCKED) mantienen su status original
    const statusMap: Record<string, number> = {
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
