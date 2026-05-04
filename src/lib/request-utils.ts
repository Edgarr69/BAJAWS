import { createHash } from 'crypto';

/**
 * Extrae la IP del request y la hashea con SHA-256 + IP_HASH_SECRET.
 * Lanza un error si la variable de entorno no está configurada.
 */
export function getHashedIp(request: Request): string {
  const headers = request.headers as Headers;

  // x-real-ip lo fija Vercel/CDN — no puede ser falsificado por el cliente
  // x-forwarded-for puede inyectarse; usar último valor como fallback
  const ip =
    headers.get('x-real-ip') ??
    headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() ??
    'unknown';

  const secret = process.env.IP_HASH_SECRET;
  if (!secret) {
    throw new Error('IP_HASH_SECRET no está configurado');
  }

  return createHash('sha256').update(ip + secret).digest('hex');
}
