import type { Metadata } from "next";
import Link from "next/link";
import ServicesList from "@/components/ServicesList";
import { siteContent } from "@/content/site";

export const metadata: Metadata = siteContent.services.meta;

export default function ServiciosPage() {
  const { title, intro, question, cta, ctaHref } = siteContent.services;

  return (
    <>
      {/* ── Cards — ocupa viewport completo ── */}
      <div className="bg-slate-50 flex flex-col" style={{ height: 'calc(100svh - 4rem)' }}>
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col flex-1 min-h-0">

          <div className="flex-shrink-0 mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-1">
              Soluciones integrales
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{title}</h1>
              <p className="text-slate-500 text-sm max-w-md leading-relaxed sm:text-right">{intro}</p>
            </div>
            <div className="mt-3 w-8 h-1 bg-emerald-600 rounded-full" />
          </div>

          <ServicesList className="flex-1 min-h-0" />

        </div>
      </div>

      {/* ── CTA — solo visible al hacer scroll ── */}
      <div className="bg-gray-50 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-center">
            <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest mb-2">
              Nuestro compromiso
            </p>
            <h2 className="text-white text-lg sm:text-2xl font-extrabold mb-2 leading-tight">{question}</h2>
            <p className="text-white/60 text-sm max-w-xl mx-auto leading-relaxed mb-5">
              Cuéntanos sobre tus necesidades y construiremos la solución ideal para tu empresa.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={ctaHref} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors duration-200 text-sm">
                {cta}
              </Link>
              <Link href="/servicios/integrales" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors duration-200 text-sm">
                Ver servicios integrales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
