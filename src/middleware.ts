import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Middleware de autenticación para /panel/*.
 *
 * Corre en el Edge runtime. Valida la sesión de Supabase server-side antes
 * de servir cualquier página del panel y elimina el flicker de los chequeos
 * client-side. La capa client-side en panel/layout.tsx queda como
 * defensa en profundidad.
 *
 * Estrategia de cookies idéntica a src/lib/supabase/server.ts:
 *   sin maxAge ni expires → cookies de sesión del navegador.
 */
// Métodos que no mutan estado — no requieren verificación de origen.
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export async function middleware(request: NextRequest) {
  // ── Defensa CSRF centralizada para /api/* ──────────────────────────────
  // Toda petición mutante a la API debe originarse en el mismo host. Los
  // route handlers aplican su propia auth por rol; aquí solo cerramos el
  // vector cross-origin en un único punto (evita depender de SameSite=Lax).
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (!SAFE_METHODS.has(request.method)) {
      const origin = request.headers.get('origin');
      const host   = request.headers.get('host');
      let sameOrigin = false;
      if (origin) {
        try {
          sameOrigin = new URL(origin).host === host;
        } catch {
          sameOrigin = false;
        }
      }
      if (!sameOrigin) {
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
      }
    }
    // Las rutas /api gestionan su propia sesión; no corremos la lógica de panel.
    return NextResponse.next({ request });
  }

  // Respuesta base: si Supabase refresca tokens, escribimos las cookies aquí
  // y devolvemos esta misma respuesta para que lleguen al navegador.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Escribimos las cookies tanto en el request (para handlers
          // posteriores en la misma cadena) como en la response (para el
          // navegador). Eliminamos maxAge/expires → cookies de sesión.
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { maxAge, expires, ...rest } = options ?? {};
            const finalOptions = maxAge === 0 ? { ...rest, maxAge: 0 } : rest;
            response.cookies.set(name, value, finalOptions);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAccesoSolicitado = request.nextUrl.pathname === '/acceso-solicitado';

  // Sin sesión → al login.
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Verificamos el rol en profiles.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role as
    | 'superadmin'
    | 'admin'
    | 'atencion'
    | 'pending'
    | undefined;

  if (!role) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (role === 'pending') {
    // Pending: solo puede ver /acceso-solicitado
    if (!isAccesoSolicitado) {
      const url = request.nextUrl.clone();
      url.pathname = '/acceso-solicitado';
      url.search = '';
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Usuario con acceso activo: no debe ver /acceso-solicitado
  if (isAccesoSolicitado) {
    const url = request.nextUrl.clone();
    url.pathname = '/panel/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/panel/:path*', '/acceso-solicitado', '/api/:path*'],
};
