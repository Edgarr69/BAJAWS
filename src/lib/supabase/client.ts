import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente Supabase para el navegador.
 * Usa cookies por defecto (requerido para PKCE y para que el server callback
 * pueda leer el code_verifier durante el intercambio OAuth).
 * Las cookies de sesión se configuran sin maxAge/expires en server.ts → mueren
 * al cerrar el navegador.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
