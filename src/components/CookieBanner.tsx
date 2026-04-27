"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible]       = useState(false);
  const [leaving, setLeaving]       = useState(false);
  const [processing, setProcessing] = useState(false);
  const dismissTimer                = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bannerRef                   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  const dismiss = (value: "accepted" | "rejected") => {
    // Bug #5: evitar clicks múltiples
    if (processing) return;
    setProcessing(true);

    localStorage.setItem("cookie-consent", value);
    setLeaving(true);

    // Bug #4: dispatch después de iniciar animación de salida
    // Bug #2: guardar ref del timer para limpiarlo si el componente se desmonta
    dismissTimer.current = setTimeout(() => {
      setVisible(false);
      window.dispatchEvent(new CustomEvent("cookie-consent-updated"));
    }, 350);
  };

  const accept = () => dismiss("accepted");
  const reject = () => dismiss("rejected");

  if (!visible) return null;

  return (
    <div
      ref={bannerRef}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
      style={{
        animation: leaving
          ? "cookie-out 0.35s ease forwards"
          : "cookie-in 0.4s cubic-bezier(0.34,1.1,0.64,1) forwards",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Texto */}
        <p className="text-sm text-gray-600 text-center sm:text-left leading-relaxed">
          Usamos cookies para analizar el tráfico del sitio y mejorar tu experiencia.{" "}
          <Link href="/aviso-privacidad" className="text-primary-600 hover:underline font-medium">
            Aviso de privacidad
          </Link>
        </p>

        {/* Botones */}
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={reject}
            disabled={processing}
            className="text-sm font-medium border border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-800 px-5 py-2 rounded-lg transition-colors duration-150 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
          >
            Rechazar
          </button>
          <button
            onClick={accept}
            disabled={processing}
            className="text-sm font-semibold bg-primary-700 hover:bg-primary-800 text-white px-5 py-2 rounded-lg transition-colors duration-150 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2"
          >
            Aceptar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes cookie-in {
          from { opacity: 0; transform: translateY(100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cookie-out {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes cookie-in  { from { opacity: 0; } to { opacity: 1; } }
          @keyframes cookie-out { from { opacity: 1; } to { opacity: 0; } }
        }
      `}</style>
    </div>
  );
}
