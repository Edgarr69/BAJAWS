/**
 * Rate limiter in-memory simple.
 *
 * ⚠️ LIMITACIÓN: funciona por proceso Node.js.
 * En producción con múltiples instancias (Vercel serverless) el estado
 * no se comparte. Para producción multi-instancia usar Upstash Redis
 * con @upstash/ratelimit.
 *
 * Para este proyecto (instancia única o tráfico bajo) es suficiente.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Limpieza periódica para no crecer indefinidamente
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 60_000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * @param key        Identificador único (ej: `submit:${ip}`)
 * @param max        Máximo de requests permitidos
 * @param windowMs   Ventana de tiempo en milisegundos
 */
export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: max - 1, resetAt };
  }

  if (entry.count >= max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt };
}
