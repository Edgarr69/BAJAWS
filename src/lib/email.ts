import { Resend } from 'resend';
import { getAdminClient } from '@/lib/supabase/admin';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface ContactData {
  nombre: string;
  telefono?: string | null;
  correo: string;
  mensaje: string;
  fuente: 'contacto' | 'cotizacion';
}

export interface PostulanteData {
  nombre: string;
  correo: string;
  telefono?: string | null;
  mensaje?: string | null;
  vacante: string;
  hasCv: boolean;
}

// ── Helpers de layout ─────────────────────────────────────────────────────────

const BRAND_DARK   = '#0B3C5D';
const BRAND_MID    = '#1a5276';
const BRAND_LIGHT  = '#d6e8f5';
const ACCENT_GREEN = '#2e7d32';
const ACCENT_BG    = '#e8f5e9';
const GRAY_BG      = '#f8f9fa';
const GRAY_BORDER  = '#e2e8f0';
const TEXT_MAIN    = '#1a202c';
const TEXT_MUTED   = '#64748b';

function emailWrapper(headerHtml: string, bodyHtml: string, footerHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Baja Wastewater Solution</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

          <!-- Header -->
          ${headerHtml}

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:32px 36px;border-left:1px solid ${GRAY_BORDER};border-right:1px solid ${GRAY_BORDER};">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${GRAY_BG};padding:20px 36px;border:1px solid ${GRAY_BORDER};border-top:none;border-radius:0 0 8px 8px;">
              ${footerHtml}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function emailHeader(badge: string, badgeColor: string, badgeBg: string): string {
  return `<tr>
    <td style="background:${BRAND_DARK};padding:28px 36px 24px;border-radius:8px 8px 0 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0 0 4px;color:#93c5e8;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">
              Baja Wastewater Solution
            </p>
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">
              Panel de administración
            </p>
          </td>
          <td align="right" valign="middle">
            <span style="display:inline-block;background:${badgeBg};color:${badgeColor};font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:5px 12px;border-radius:20px;">
              ${badge}
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function infoRow(label: string, value: string, isLast = false): string {
  return `<tr>
    <td style="padding:12px 0;border-bottom:${isLast ? 'none' : `1px solid ${GRAY_BORDER}`};">
      <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:0.8px;">${label}</p>
      <p style="margin:0;font-size:14px;color:${TEXT_MAIN};line-height:1.5;">${value}</p>
    </td>
  </tr>`;
}

function ctaButton(text: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin-top:28px;">
    <tr>
      <td style="background:${BRAND_DARK};border-radius:6px;">
        <a href="${url}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">
          ${text} &rarr;
        </a>
      </td>
    </tr>
  </table>`;
}

function emailFooter(): string {
  return `<table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td>
        <p style="margin:0 0 4px;font-size:12px;color:${TEXT_MUTED};">
          Baja Wastewater Solution &mdash; Tijuana, B.C., México
        </p>
        <p style="margin:0;font-size:11px;color:#94a3b8;">
          Este correo es un aviso automático del sistema. No responder directamente.
        </p>
      </td>
      <td align="right" valign="middle">
        <p style="margin:0;font-size:11px;color:#94a3b8;">bajaws.com.mx</p>
      </td>
    </tr>
  </table>`;
}

// ── Email de postulación ──────────────────────────────────────────────────────

function buildPostulanteHtml(data: PostulanteData): string {
  const header = emailHeader('Nueva postulación', ACCENT_GREEN, ACCENT_BG);

  const body = `
    <p style="margin:0 0 6px;font-size:13px;color:${TEXT_MUTED};">Vacante</p>
    <p style="margin:0 0 24px;font-size:22px;font-weight:700;color:${BRAND_DARK};letter-spacing:-0.3px;">${escHtml(data.vacante)}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${GRAY_BORDER};">
      ${infoRow('Nombre del candidato', escHtml(data.nombre))}
      ${infoRow('Correo electrónico', `<a href="mailto:${escHtml(data.correo)}" style="color:${BRAND_MID};text-decoration:none;">${escHtml(data.correo)}</a>`)}
      ${infoRow('Teléfono', data.telefono ? escHtml(data.telefono) : '<span style="color:#94a3b8;">No proporcionado</span>')}
      ${infoRow('CV adjunto', data.hasCv
        ? `<span style="display:inline-flex;align-items:center;gap:6px;background:${ACCENT_BG};color:${ACCENT_GREEN};font-size:13px;font-weight:600;padding:3px 10px;border-radius:4px;">&#10003; Disponible en el panel</span>`
        : `<span style="color:#94a3b8;">No adjuntó CV</span>`,
        !data.mensaje
      )}
      ${data.mensaje ? infoRow('Mensaje del candidato', `<span style="white-space:pre-wrap;line-height:1.6;">${escHtml(data.mensaje)}</span>`, true) : ''}
    </table>

    ${ctaButton('Ver postulaciones en el panel', 'https://bajaws.com.mx/panel/postulaciones')}
  `;

  return emailWrapper(header, body, emailFooter());
}

// ── Email de contacto / cotización ────────────────────────────────────────────

function buildContactHtml(data: ContactData): string {
  const esCotizacion = data.fuente === 'cotizacion';
  const badge        = esCotizacion ? 'Solicitud de cotización' : 'Mensaje de contacto';
  const badgeColor   = esCotizacion ? '#92400e' : BRAND_MID;
  const badgeBg      = esCotizacion ? '#fef3c7' : BRAND_LIGHT;

  const header = emailHeader(badge, badgeColor, badgeBg);

  const body = `
    <p style="margin:0 0 24px;font-size:22px;font-weight:700;color:${BRAND_DARK};letter-spacing:-0.3px;">
      ${esCotizacion ? 'Nueva solicitud de cotización' : 'Nuevo mensaje de contacto'}
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${GRAY_BORDER};">
      ${infoRow('Nombre', escHtml(data.nombre))}
      ${infoRow('Correo electrónico', `<a href="mailto:${escHtml(data.correo)}" style="color:${BRAND_MID};text-decoration:none;">${escHtml(data.correo)}</a>`)}
      ${infoRow('Teléfono', data.telefono ? escHtml(data.telefono) : '<span style="color:#94a3b8;">No proporcionado</span>')}
      ${infoRow('Tipo', esCotizacion
        ? `<span style="background:#fef3c7;color:#92400e;font-size:12px;font-weight:600;padding:2px 10px;border-radius:4px;">Cotización</span>`
        : `<span style="background:${BRAND_LIGHT};color:${BRAND_MID};font-size:12px;font-weight:600;padding:2px 10px;border-radius:4px;">Contacto</span>`
      )}
      ${infoRow('Mensaje', `<span style="white-space:pre-wrap;line-height:1.6;">${escHtml(data.mensaje)}</span>`, true)}
    </table>

    ${ctaButton('Ver mensaje en el panel', 'https://bajaws.com.mx/panel/contactos')}
  `;

  return emailWrapper(header, body, emailFooter());
}

// ── Funciones de envío ────────────────────────────────────────────────────────

export async function sendPostulanteNotification(data: PostulanteData): Promise<void> {
  const admin = getAdminClient();
  const { data: rows, error } = await admin
    .from('notification_emails')
    .select('email')
    .eq('is_active', true)
    .eq('notify_postulantes', true);

  if (error) {
    console.error('[email] error al obtener notification_emails para postulantes:', error.message);
    return;
  }
  if (!rows || rows.length === 0) return;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[email] RESEND_API_KEY no está configurada');
    return;
  }

  const resend  = new Resend(apiKey);
  const subject = `[Postulación] ${data.nombre} — ${data.vacante}`;
  const html    = buildPostulanteHtml(data);

  await Promise.all(
    rows.map(({ email }: { email: string }) =>
      resend.emails
        .send({ from: 'Bajaws <notificaciones@bajaws.com.mx>', to: email, subject, html })
        .catch((err: unknown) => console.error(`[email] error al enviar a ${email}:`, err))
    )
  );
}

export async function sendContactNotification(data: ContactData): Promise<void> {
  const admin = getAdminClient();
  const { data: rows, error } = await admin
    .from('notification_emails')
    .select('email')
    .eq('is_active', true);

  if (error) {
    console.error('[email] error al obtener notification_emails:', error.message);
    return;
  }
  if (!rows || rows.length === 0) return;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[email] RESEND_API_KEY no está configurada');
    return;
  }

  const tipo    = data.fuente === 'cotizacion' ? 'Cotización' : 'Contacto';
  const resend  = new Resend(apiKey);
  const subject = `[${tipo}] ${data.nombre}`;
  const html    = buildContactHtml(data);

  await Promise.all(
    rows.map(({ email }: { email: string }) =>
      resend.emails
        .send({ from: 'Bajaws <notificaciones@bajaws.com.mx>', to: email, subject, html })
        .catch((err: unknown) => console.error(`[email] error al enviar a ${email}:`, err))
    )
  );
}
