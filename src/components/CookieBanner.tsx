"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Pequeño delay para que no aparezca al mismo tiempo que carga la página
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const essential = () => {
    localStorage.setItem("cookie-consent", "essential");
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 max-w-[300px] w-full"
      style={{ animation: "cookie-in 0.4s cubic-bezier(0.34,1.1,0.64,1) forwards" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base">🍪</span>
            <span className="text-sm font-semibold text-slate-800">Cookies</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Usamos cookies esenciales para el funcionamiento del sitio.{" "}
            <Link
              href="/aviso-privacidad"
              className="text-primary-600 hover:underline"
            >
              Más información
            </Link>
          </p>
        </div>

        {/* Botones */}
        <div className="px-4 py-3 flex flex-col gap-2">
          <button
            onClick={accept}
            className="w-full text-xs font-semibold bg-primary-700 hover:bg-primary-800 text-white px-3 py-2 rounded-lg transition-colors duration-150"
          >
            Aceptar todo
          </button>
          <button
            onClick={essential}
            className="w-full text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg transition-colors duration-150"
          >
            Solo esenciales
          </button>
          <button
            onClick={reject}
            className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors duration-150 py-1"
          >
            Rechazar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes cookie-in {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
