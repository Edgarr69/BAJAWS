import { randomBytes } from 'crypto';

/**
 * Base32 "humano": excluye caracteres ambiguos (0, O, I, 1).
 * 32 chars exactos → 256 % 32 = 0 → sin modulo bias.
 * 8 chars → 32^8 = ~1.1 billón de combinaciones.
 */
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Genera un código corto de `length` caracteres.
 * Usar en servidor únicamente (requiere Node.js crypto).
 */
export function generateShortCode(length = 8): string {
  const bytes = randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CHARSET[bytes[i] % 32];
  }
  return code;
}

/**
 * Genera un código único verificando colisiones contra la BD.
 * Delega la generación al RPC create_feedback_link en Supabase
 * (que también usa generate_short_code en PL/pgSQL con la misma lógica).
 * Esta función server-side es útil para tests o scripts externos.
 */
export function validateShortCode(code: string): boolean {
  if (code.length !== 8) return false;
  return [...code].every(c => CHARSET.includes(c.toUpperCase()));
}
