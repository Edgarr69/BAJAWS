import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export interface RateLimitResult {
  allowed:   boolean;
  remaining: number;
  resetAt:   number;
}

// ── Upstash Redis (producción) ────────────────────────────────────────────────

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

const limiters = new Map<string, Ratelimit>();

function msToWindow(ms: number): `${number} ms` | `${number} s` | `${number} m` | `${number} h` | `${number} d` {
  if (ms < 1_000)        return `${ms} ms`;
  if (ms < 60_000)       return `${Math.round(ms / 1_000)} s`;
  if (ms < 3_600_000)    return `${Math.round(ms / 60_000)} m`;
  if (ms < 86_400_000)   return `${Math.round(ms / 3_600_000)} h`;
  return `${Math.round(ms / 86_400_000)} d`;
}

function getUpstashLimiter(max: number, windowMs: number): Ratelimit {
  const key = `${max}:${windowMs}`;
  if (!limiters.has(key)) {
    limiters.set(key, new Ratelimit({
      redis:    Redis.fromEnv(),
      limiter:  Ratelimit.slidingWindow(max, msToWindow(windowMs)),
      analytics: false,
    }));
  }
  return limiters.get(key)!;
}

async function checkUpstash(identifier: string, max: number, windowMs: number): Promise<RateLimitResult> {
  const limiter = getUpstashLimiter(max, windowMs);
  const { success, remaining, reset } = await limiter.limit(identifier);
  return { allowed: success, remaining, resetAt: Number(reset) };
}

// ── Fallback in-memory (desarrollo / sin credenciales) ───────────────────────

interface Entry { count: number; resetAt: number }
const store = new Map<string, Entry>();

setInterval(() => {
  const now = Date.now();
  for (const [k, e] of store) if (e.resetAt < now) store.delete(k);
}, 60_000);

function checkMemory(identifier: string, max: number, windowMs: number): RateLimitResult {
  const now   = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetAt < now) {
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }
  if (entry.count >= max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count += 1;
  return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt };
}

// ── Interfaz pública ──────────────────────────────────────────────────────────

export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (hasUpstash) return checkUpstash(key, max, windowMs);
  return checkMemory(key, max, windowMs);
}
