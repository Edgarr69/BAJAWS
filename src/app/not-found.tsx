import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada | Baja Wastewater Solution",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <p className="text-7xl font-black text-primary-100 mb-2 leading-none">404</p>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Página no encontrada</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          La página que buscas no existe o fue movida. Usa los enlaces de abajo para continuar.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="bg-primary-700 hover:bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors duration-200"
          >
            Ir al inicio
          </Link>
          <Link
            href="/servicios"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors duration-200"
          >
            Ver servicios
          </Link>
          <Link
            href="/contacto"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors duration-200"
          >
            Contacto
          </Link>
        </div>
      </div>
    </div>
  );
}
