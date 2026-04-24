/**
 * GET /auth/callback
 * Supabase usa esta ruta para el flujo PKCE de recuperación de contraseña.
 * Las cookies DEBEN escribirse en el NextResponse (no en cookieStore)
 * porque en Route Handlers cookieStore es de solo lectura.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get('code');
  // Validar que next sea ruta relativa segura — previene open redirect via @host o //host
  const rawNext = searchParams.get('next') ?? '/';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.includes('@')
    ? rawNext
    : '/';

  if (code) {
    // Respuesta de redirección que recibirá las cookies de sesión
    const res = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Sin maxAge/expires → cookie de sesión (muere al cerrar el navegador)
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { maxAge, expires, ...sessionOnly } = options ?? {};
              res.cookies.set(name, value, sessionOnly);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return res;
  }

  return NextResponse.redirect(`${origin}/?error=auth`);
}
