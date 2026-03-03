import type { NextConfig } from "next";

// ─────────────────────────────────────────────────────────────────────────────
// Headers de seguridad HTTP — aplicados a todas las rutas
// ─────────────────────────────────────────────────────────────────────────────
const CSP = [
  "default-src 'self'",
  // Next.js App Router requiere unsafe-inline / unsafe-eval para hidratación
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  // next/font descarga y sirve las fuentes localmente
  "font-src 'self' data:",
  // Imágenes locales + data URIs + avatares de Google OAuth
  "img-src 'self' data: blob: https://lh3.googleusercontent.com",
  // Video local (src/videos/*)
  "media-src 'self'",
  // Iframes permitidos: YouTube (sin cookies) y Google Maps
  "frame-src https://www.youtube-nocookie.com https://maps.google.com https://www.google.com",
  // Peticiones fetch/XHR solo al mismo origen
  "connect-src 'self'",
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
  // Política de contenido — la más importante
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
