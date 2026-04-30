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
import { createHash } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateShortCode } from '@/utils/shortcode';

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
  } catch {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  // x-real-ip lo fija Vercel/CDN — no puede ser falsificado por el cliente
  const ip = req.headers.get('x-real-ip')
           ?? req.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim()
           ?? 'unknown';

  // Rate limit: 5 envíos por IP por 10 minutos
  const rl = checkRateLimit(`submit:${ip}`, 5, 600_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'RATE_LIMIT', message: 'Demasiados envíos. Intenta más tarde.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  const body = await req.json().catch(() => null);
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

  // Hash de IP: no reversible (SHA-256 + secret de entorno)
  const secret = process.env.IP_HASH_SECRET;
  if (!secret) {
    console.error('IP_HASH_SECRET no está configurado');
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
  const ipHash  = createHash('sha256').update(ip + secret).digest('hex');

  const supabase = await createClient();
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
    const { data: link } = await admin
      .from('feedback_links')
      .select('id')
      .eq('code', code.toUpperCase())
      .single();

    if (link?.id) {
      // Buscar la submission por link_id; fallback a feedback_link_id si la columna usa ese nombre
      let { data: latest } = await admin
        .from('feedback_submissions')
        .select('id')
        .eq('link_id', link.id)
        .eq('ip_hash', ipHash)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latest?.id) {
        ({ data: latest } = await admin
          .from('feedback_submissions')
          .select('id')
          .eq('feedback_link_id', link.id)
          .eq('ip_hash', ipHash)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .maybeSingle());
      }

      if (latest?.id) {
        await admin
          .from('feedback_submissions')
          .update({
            ...(company_name?.trim() ? { company_name: company_name.trim() } : {}),
            ...(private_comment?.trim() ? { private_comment: private_comment.trim() } : {}),
          })
          .eq('id', latest.id);
      }
    }
  }

  return NextResponse.json(data, { status: 201 });
}
