import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Cliente Supabase para Server Components y Route Handlers.
 * Las cookies NO tienen maxAge/expires → son de sesión del navegador.
 * Al cerrar el navegador se eliminan automáticamente.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { maxAge, expires, ...rest } = options ?? {};
              // maxAge: 0 significa borrar la cookie — lo dejamos pasar.
              // Para el resto, eliminamos maxAge/expires → cookie de sesión.
              const finalOptions = maxAge === 0 ? { ...rest, maxAge: 0 } : rest;
              cookieStore.set(name, value, finalOptions);
            });
          } catch {
            // En Server Components las cookies son de solo lectura; se ignora.
          }
        },
      },
    }
  );
}
