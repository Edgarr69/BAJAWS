"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export default function CookieBanner() {
  const [visible, setVisible]       = useState(false);
  const [leaving, setLeaving]       = useState(false);
  const [processing, setProcessing] = useState(false);
  const dismissTimer                = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  // Bloquear scroll del body mientras el modal está visible
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [visible]);

  useEffect(() => {
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  const dismiss = (value: "accepted" | "rejected" | null) => {
    if (processing) return;
    setProcessing(true);

    if (value) localStorage.setItem("cookie-consent", value);
    setLeaving(true);

    dismissTimer.current = setTimeout(() => {
      setVisible(false);
      if (value) window.dispatchEvent(new CustomEvent("cookie-consent-updated"));
    }, 300);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        animation: leaving
          ? "overlay-out 0.3s ease forwards"
          : "overlay-in 0.3s ease forwards",
      }}
    >
      {/* Fondo oscuro */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Consentimiento de cookies"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4"
        style={{
          animation: leaving
            ? "modal-out 0.3s ease forwards"
            : "modal-in 0.3s cubic-bezier(0.34,1.1,0.64,1) forwards",
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={() => dismiss(null)}
          disabled={processing}
          aria-label="Cerrar"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-150 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded-lg p-1"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Texto */}
        <div className="pr-6">
          <p className="text-sm font-semibold text-slate-800 mb-1">Usamos cookies</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Usamos cookies para analizar el tráfico del sitio y mejorar tu experiencia.{" "}
            <Link href="/aviso-privacidad" className="text-primary-600 hover:underline font-medium">
              Aviso de privacidad
            </Link>
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={() => dismiss("rejected")}
            disabled={processing}
            className="flex-1 text-sm font-medium border border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-800 px-4 py-2.5 rounded-xl transition-colors duration-150 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
          >
            Rechazar
          </button>
          <button
            onClick={() => dismiss("accepted")}
            disabled={processing}
            className="flex-1 text-sm font-semibold bg-primary-700 hover:bg-primary-800 text-white px-4 py-2.5 rounded-xl transition-colors duration-150 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2"
          >
            Aceptar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes overlay-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes overlay-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes modal-in  { from { opacity: 0; transform: scale(0.92) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes modal-out { from { opacity: 1; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(0.95) translateY(4px); } }
        @media (prefers-reduced-motion: reduce) {
          @keyframes overlay-in  { from { opacity: 0; } to { opacity: 1; } }
          @keyframes overlay-out { from { opacity: 1; } to { opacity: 0; } }
          @keyframes modal-in    { from { opacity: 0; } to { opacity: 1; } }
          @keyframes modal-out   { from { opacity: 1; } to { opacity: 0; } }
        }
      `}</style>
    </div>
  );
}
