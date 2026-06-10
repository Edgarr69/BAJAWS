/**
 * POST /api/public/submit
 * Endpoint público: recibe respuestas del cliente y llama al RPC submit_feedback.
 * No requiere autenticación.
 *
 * Rate limit: 5 envíos por IP cada 10 minutos.
 * IP hasheada con SHA-256 + secret antes de almacenarla.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateShortCode } from '@/utils/shortcode';
import { getHashedIp } from '@/lib/request-utils';

const answerSchema = z.object({
  question_id: z.number().int().positive(),
  value:       z.number().int().min(1).max(5),
  comment:     z.string().max(500).optional(),
});

const schema = z.object({
  code:            z.string().length(8, 'El código debe tener exactamente 8 caracteres'),
  answers:         z.array(answerSchema).min(1).max(50),
  company_name:    z.string().max(120).optional(),
  private_comment: z.string().max(500).optional(),
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
  } catch (err) {
    console.error('[public/submit] origin inválido en verificación CSRF:', err);
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  let ipHash: string;
  try {
    ipHash = getHashedIp(req);
  } catch {
    console.error('IP_HASH_SECRET no está configurado');
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }

  // Rate limit: 5 envíos por IP por 10 minutos
  const rl = await checkRateLimit(`submit:${ipHash}`, 5, 600_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'RATE_LIMIT', message: 'Demasiados envíos. Intenta más tarde.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  const body = await req.json().catch((err: unknown) => {
    console.error('[public/submit] error al parsear JSON del body:', err);
    return null;
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'INVALID_PAYLOAD', message: 'Datos inválidos' },
      { status: 400 }
    );
  }

  const { code, answers, company_name, private_comment } = parsed.data;

  if (!validateShortCode(code)) {
    return NextResponse.json({ error: 'INVALID', message: 'Código inválido' }, { status: 400 });
  }

  // Service role: el visitante no tiene sesión y el RPC no depende de auth.uid().
  // Permite revocar EXECUTE de anon/authenticated y cerrar el acceso directo vía PostgREST.
  const supabase = getAdminClient();
  const { data, error } = await supabase.rpc('submit_feedback', {
    p_code:    code.toUpperCase(),
    p_answers: answers,
    p_ip_hash: ipHash,
  });

  if (error) {
    console.error('submit_feedback RPC error:', error.message);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }

  if (data?.error) {
    const statusMap: Record<string, number> = {
      INVALID:          404,
      EXPIRED:          410,
      USED:             409,
      BLOCKED:          403,
      RATE_LIMIT:       429,
      INVALID_PAYLOAD:  400,
      INVALID_VALUE:    400,
      INVALID_QUESTION: 400,
    };
    return NextResponse.json(data, { status: statusMap[data.error] ?? 400 });
  }

  // Si se proporcionaron campos adicionales, actualizamos la submission recién creada.
  // El enlace es de un solo uso → su link_id identifica unívocamente la submission, sin
  // riesgo de race condition con envíos concurrentes desde la misma NAT IP.
  if (company_name?.trim() || private_comment?.trim()) {
    const admin = getAdminClient();
    const { data: link, error: linkError } = await admin
      .from('feedback_links')
      .select('id')
      .eq('code', code.toUpperCase())
      .single();

    if (linkError) {
      console.error('[public/submit] error buscando feedback_link para UPDATE secundario:', linkError.message);
    } else if (link?.id) {
      const { data: latest, error: submissionError } = await admin
        .from('feedback_submissions')
        .select('id')
        .eq('link_id', link.id)
        .eq('ip_hash', ipHash)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (submissionError) {
        console.error('[public/submit] error buscando feedback_submission para UPDATE secundario:', submissionError.message);
      } else if (latest?.id) {
        const { error: updateError } = await admin
          .from('feedback_submissions')
          .update({
            ...(company_name?.trim() ? { company_name: company_name.trim() } : {}),
            ...(private_comment?.trim() ? { private_comment: private_comment.trim() } : {}),
          })
          .eq('id', latest.id);

        if (updateError) {
          console.error('[public/submit] error guardando company_name/private_comment en submission', latest.id, ':', updateError.message);
        }
      } else {
        console.error('[public/submit] no se encontró submission para link_id', link.id, 'ip_hash', ipHash);
      }
    }
  }

  return NextResponse.json(data, { status: 201 });
}
