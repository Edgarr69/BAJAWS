import type { Metadata } from "next";
import Link from "next/link";
import Section from "@/components/Section";
import ServicesList from "@/components/ServicesList";
import { siteContent } from "@/content/site";

export const metadata: Metadata = siteContent.services.meta;

export default function ServiciosPage() {
  const { title, intro, question, cta, ctaHref } = siteContent.services;

  return (
    <>
      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 py-7 sm:py-9">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-3">Soluciones integrales</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{title}</h1>
          <div className="mt-4 w-10 h-1 bg-emerald-600 rounded-full" />
        </div>
      </div>

      <Section>
        {/* Intro */}
        <p className="text-center text-gray-600 text-lg max-w-2xl mx-auto mb-14 leading-relaxed">
          {intro}
        </p>

        {/* Service cards */}
        <ServicesList />

        {/* CTA */}
        <div className="mt-16">
          <div className="bg-gradient-to-br from-primary-800 to-slate-900 rounded-3xl p-8 sm:p-10 text-center">
            <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest mb-3">
              Nuestro compromiso
            </p>
            <h2 className="text-white text-2xl sm:text-3xl font-extrabold mb-4 leading-tight">{question}</h2>
            <p className="text-white/60 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8">
              Cuéntanos sobre tus necesidades y construiremos la solución ideal para tu empresa.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={ctaHref}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-7 py-3 rounded-xl transition-colors duration-200 text-sm"
              >
                {cta}
              </Link>
              <Link
                href="/servicios/integrales"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-7 py-3 rounded-xl transition-colors duration-200 text-sm"
              >
                Ver servicios integrales
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
