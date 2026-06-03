import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Página no encontrada | Baja Wastewater Solution",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full text-center">
          <p className="text-8xl font-black text-primary-700 leading-none mb-4">
            404
          </p>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Página no encontrada
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            La dirección que ingresaste no existe o fue movida a otra ubicación.
            Verifica el enlace o regresa al inicio.
          </p>
          <Link
            href="/"
            className="inline-block bg-primary-700 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors duration-200"
          >
            Ir al inicio
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
