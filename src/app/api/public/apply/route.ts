/**
 * POST /api/public/apply
 * Endpoint público: recibe postulaciones de empleo (multipart/form-data).
 * No requiere autenticación — rate-limited por IP.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { getHashedIp, bodyTooLarge } from '@/lib/request-utils';
import { sendPostulanteNotification } from '@/lib/email';

// Tope de body: alineado con el cap de plataforma de Vercel (~4.5 MB).
// El CV se limita a 4 MB (abajo) para dejar margen a los campos del form.
const MAX_BODY = Math.floor(4.5 * 1024 * 1024);
const MAX_CV   = 4 * 1024 * 1024;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Elimina null bytes, saltos de línea y etiquetas HTML
// Los \r\n en el subject de un email permiten header injection aunque el SDK los codifique
function sanitize(value: string): string {
  return value
    .replace(/\0/g, '')
    .replace(/[\r\n]/g, ' ')
    .replace(/<[^>]*>/g, '')
    .trim();
}

export async function POST(req: NextRequest) {
  // CSRF
  const origin = req.headers.get('origin');
  const host   = req.headers.get('host');
  if (!origin) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  try {
    if (new URL(origin).host !== host) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  } catch {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  if (bodyTooLarge(req, MAX_BODY)) {
    return NextResponse.json({ error: 'PAYLOAD_TOO_LARGE', message: 'El envío es demasiado grande.' }, { status: 413 });
  }

  let ipHash: string;
  try {
    ipHash = getHashedIp(req);
  } catch {
    console.error('[apply] IP_HASH_SECRET no configurado');
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }

  // 3 postulaciones por IP cada 30 minutos
  const rl = await checkRateLimit(`apply:${ipHash}`, 3, 1_800_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'RATE_LIMIT', message: 'Demasiados envíos. Intenta más tarde.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  const formData = await req.formData().catch((err: unknown) => {
    console.error('[apply] formData parse error:', err);
    return null;
  });
  if (!formData) return NextResponse.json({ error: 'INVALID' }, { status: 400 });

  // Honeypot
  if (formData.get('hp')) return NextResponse.json({ ok: true }, { status: 201 });

  const posting_id = String(formData.get('posting_id') ?? '').trim();
  const nombre     = sanitize(String(formData.get('nombre')   ?? ''));
  const correo     = sanitize(String(formData.get('correo')   ?? '')).toLowerCase();
  const telefono   = sanitize(String(formData.get('telefono') ?? '')) || null;
  const mensaje    = sanitize(String(formData.get('mensaje')  ?? '')) || null;
  const cvEntry    = formData.get('cv');
  const cvFile     = cvEntry instanceof File && cvEntry.size > 0 ? cvEntry : null;

  if (!UUID_REGEX.test(posting_id)) return NextResponse.json({ error: 'INVALID', field: 'posting_id' }, { status: 400 });
  if (!nombre || nombre.length < 2 || nombre.length > 80) return NextResponse.json({ error: 'INVALID', field: 'nombre' }, { status: 400 });
  if (!EMAIL_RE.test(correo) || correo.length > 120) return NextResponse.json({ error: 'INVALID', field: 'correo' }, { status: 400 });
  if (telefono && telefono.length > 20) return NextResponse.json({ error: 'INVALID', field: 'telefono' }, { status: 400 });
  if (mensaje && mensaje.length > 1000) return NextResponse.json({ error: 'INVALID', field: 'mensaje' }, { status: 400 });

  if (cvFile) {
    if (cvFile.type !== 'application/pdf') {
      return NextResponse.json({ error: 'INVALID', field: 'cv', message: 'Solo se aceptan archivos PDF' }, { status: 400 });
    }
    if (cvFile.size > MAX_CV) {
      return NextResponse.json({ error: 'INVALID', field: 'cv', message: 'El CV no puede superar 4 MB' }, { status: 400 });
    }
  }

  const admin = getAdminClient();

  // Verificar que la vacante existe y está activa
  const { data: posting, error: postingErr } = await admin
    .from('job_postings')
    .select('id, titulo')
    .eq('id', posting_id)
    .eq('is_active', true)
    .single();

  if (postingErr || !posting) {
    return NextResponse.json({ error: 'NOT_FOUND', message: 'La vacante no existe o ya no está disponible' }, { status: 404 });
  }

  // Verificar que el correo no haya aplicado ya a esta vacante
  const { count: existing } = await admin
    .from('job_applications')
    .select('id', { count: 'exact', head: true })
    .eq('posting_id', posting_id)
    .eq('correo', correo);

  // Duplicado: respondemos igual que un alta exitosa para no revelar si un
  // correo ya postuló a esta vacante (evita enumeración de postulantes).
  if (existing && existing > 0) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  // Subir CV si se proporcionó
  let cv_path: string | null = null;
  if (cvFile) {
    const bytes  = await cvFile.arrayBuffer();

    // Un PDF válido tiene al menos la firma %PDF (4 bytes). Evita el
    // RangeError de new Uint8Array(bytes, 0, 4) con archivos de 1–3 bytes.
    if (bytes.byteLength < 4) {
      return NextResponse.json(
        { error: 'INVALID', field: 'cv', message: 'El archivo no es un PDF válido.' },
        { status: 400 }
      );
    }

    // Verificar magic bytes reales — el MIME del navegador puede ser spoofed
    // PDF válido comienza con %PDF (0x25 0x50 0x44 0x46)
    const magic = new Uint8Array(bytes, 0, 4);
    if (magic[0] !== 0x25 || magic[1] !== 0x50 || magic[2] !== 0x44 || magic[3] !== 0x46) {
      return NextResponse.json(
        { error: 'INVALID', field: 'cv', message: 'El archivo no es un PDF válido.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(bytes);
    const path   = `applications/${crypto.randomUUID()}.pdf`;

    const { error: uploadErr } = await admin.storage
      .from('cvs')
      .upload(path, buffer, { contentType: 'application/pdf', upsert: false });

    if (uploadErr) {
      console.error('[apply] storage upload error:', uploadErr.message);
      // Continúa sin CV antes de perder la postulación completa
    } else {
      cv_path = path;
    }
  }

  // Insertar postulación
  const { error: insertErr } = await admin.from('job_applications').insert({
    posting_id,
    nombre,
    correo,
    telefono,
    mensaje,
    cv_path,
    ip_hash: ipHash,
  });

  if (insertErr) {
    // 23505 = unique_violation — duplicado que pasó la carrera entre el check y el insert.
    // Misma respuesta genérica que el alta exitosa (anti-enumeración).
    if ((insertErr as { code?: string }).code === '23505') {
      return NextResponse.json({ ok: true }, { status: 201 });
    }
    console.error('[apply] insert error:', insertErr.message);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }

  // Notificación por email (non-blocking)
  try {
    await sendPostulanteNotification({
      nombre,
      correo,
      telefono,
      mensaje,
      vacante: posting.titulo,
      hasCv: !!cv_path,
    });
  } catch (emailErr) {
    console.error('[apply] email notification error:', emailErr);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
