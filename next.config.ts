import type { NextConfig } from "next";

// ─────────────────────────────────────────────────────────────────────────────
// Headers de seguridad HTTP — aplicados a todas las rutas
// ─────────────────────────────────────────────────────────────────────────────
const CSP = [
  "default-src 'self'",
  // Next.js App Router requiere unsafe-inline para hidratación
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  // next/font descarga y sirve las fuentes localmente
  "font-src 'self' data:",
  // Imágenes locales + data URIs
  "img-src 'self' data: blob: https://i.ytimg.com https://www.googletagmanager.com",
  // Video local (src/videos/*)
  "media-src 'self'",
  // Iframes permitidos: YouTube (sin cookies) y Google Maps
  "frame-src https://www.youtube-nocookie.com https://maps.google.com https://www.google.com https://www.googletagmanager.com",
  // Peticiones fetch/XHR: mismo origen + Supabase (requerido para signInWithPassword y realtime)
  "connect-src 'self' https://dlgergnuqxzexsjeuztg.supabase.co https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net",
  // El formulario solo puede enviar datos al mismo origen
  "form-action 'self'",
  // Evita inyección de <base>
  "base-uri 'self'",
  // Sin Flash ni plugins
  "object-src 'none'",
  // Impide que este sitio sea embebido en un iframe externo (clickjacking)
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  // Evita que el navegador detecte MIME types distintos al declarado
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Protección XSS para navegadores antiguos
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Bloquea embebido en iframes externos (compatibilidad con navegadores sin soporte CSP frame-ancestors)
  { key: "X-Frame-Options", value: "DENY" },
  // Solo enviar el origen en requests cross-origin
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Deshabilitar cámara, micrófono y otras APIs sensibles
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // HTTPS obligatorio por 2 años (solo en producción con HTTPS real)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Aísla el contexto del navegador — previene ataques de timing cross-origin (Spectre)
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Bloquea que Adobe Flash/Reader accedan a datos del dominio (legacy)
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  // Política de contenido — la más importante
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  async headers() {
    return [
      // API routes — CORS + sin caché + solo cargables desde el mismo origen
      {
        source: "/api/:path*",
        headers: [
          // CORS: solo el origen de producción puede llamar desde otro dominio
          { key: "Access-Control-Allow-Origin",      value: "https://bajaws.mx" },
          { key: "Access-Control-Allow-Methods",     value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers",     value: "Content-Type, Authorization" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          // Impide que proxies o el navegador cacheen respuestas con datos sensibles
          { key: "Cache-Control",                    value: "no-store, max-age=0" },
          // Bloquea que otros sitios carguen este endpoint directamente (fetch desde otra web)
          { key: "Cross-Origin-Resource-Policy",     value: "same-origin" },
        ],
      },
      // Seguridad HTTP — aplica a todas las rutas
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
