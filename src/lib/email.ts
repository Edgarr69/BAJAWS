import { Resend } from 'resend';
import { getAdminClient } from '@/lib/supabase/admin';

export interface ContactData {
  nombre: string;
  telefono?: string | null;
  correo: string;
  mensaje: string;
  fuente: 'contacto' | 'cotizacion';
}

function buildHtml(data: ContactData): string {
  const tipo = data.fuente === 'cotizacion' ? 'Cotización' : 'Contacto';
  const panelUrl = 'https://bajaws.com.mx/panel/contactos';

  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding:8px 12px;font-weight:600;background:#f4f4f4;border:1px solid #ddd;white-space:nowrap">${label}</td>
      <td style="padding:8px 12px;border:1px solid #ddd">${value}</td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /></head>
<body style="font-family:sans-serif;color:#222;margin:0;padding:24px">
  <h2 style="margin-top:0">Nuevo mensaje de ${tipo}</h2>
  <table style="border-collapse:collapse;width:100%;max-width:560px">
    ${row('Nombre', data.nombre)}
    ${row('Teléfono', data.telefono || '—')}
    ${row('Correo', data.correo)}
    ${row('Tipo', tipo)}
    ${row('Mensaje', data.mensaje.replace(/\n/g, '<br>'))}
  </table>
  <p style="margin-top:24px">
    <a href="${panelUrl}" style="background:#0B3C5D;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px">
      Ver en el panel
    </a>
  </p>
</body>
</html>`;
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

  if (!rows || rows.length === 0) {
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[email] RESEND_API_KEY no está configurada');
    return;
  }

  const resend = new Resend(apiKey);
  const tipo = data.fuente === 'cotizacion' ? 'Cotización' : 'Contacto';
  const subject = `[${tipo}] ${data.nombre}`;
  const html = buildHtml(data);

  await Promise.all(
    rows.map(({ email }: { email: string }) =>
      resend.emails
        .send({
          from: 'Bajaws <notificaciones@bajaws.com.mx>',
          to: email,
          subject,
          html,
        })
        .catch((err: unknown) => {
          console.error(`[email] error al enviar a ${email}:`, err);
        })
    )
  );
}
