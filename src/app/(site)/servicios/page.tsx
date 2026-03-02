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
        <div className="mt-20 text-center bg-gray-50 rounded-2xl p-10 border border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{question}</h2>
          <p className="text-gray-500 mb-7 max-w-lg mx-auto">
            Cuéntanos sobre tus necesidades y construiremos la solución ideal para tu empresa.
          </p>
          <Link
            href={ctaHref}
            className="inline-block bg-primary-700 hover:bg-primary-600 text-white font-bold px-8 py-4 rounded-xl text-sm tracking-widest uppercase transition-colors duration-200 shadow-lg shadow-primary-900/20"
          >
            {cta}
          </Link>
        </div>
      </Section>
    </>
  );
}
