import type { Metadata } from "next";
import Image from "next/image";
import Section from "@/components/Section";
import AuthorizationsTable from "@/components/AuthorizationsTable";
import { siteContent } from "@/content/site";

export const metadata: Metadata = siteContent.autorizaciones.meta;

export default function AutorizacionesPage() {
  const { title, intro } = siteContent.autorizaciones;

  return (
    <>
      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 py-7 sm:py-9">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-3">Cumplimiento legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{title}</h1>
          <div className="mt-4 w-10 h-1 bg-emerald-600 rounded-full" />
        </div>
      </div>

      <Section>
        {/* Intro — texto + foto documentos */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center mb-12">

          {/* Texto */}
          <div className="lg:col-span-3">
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed text-justify">
              {intro}
            </p>
          </div>

          {/* Foto documentos */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
              <Image
                src="/images/autorizaciones.jpg"
                alt="Autorizaciones oficiales de Baja Wastewater Solution"
                width={600}
                height={600}
                className="w-full h-56 lg:h-64 object-cover"
              />
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Autorizaciones físicas emitidas por CESPT, SEMAR y SEMARNAT
            </p>
          </div>
        </div>

        {/* Tabla */}
        <AuthorizationsTable />

        <p className="mt-6 text-xs text-gray-400 text-center">
          Información vigente según registros oficiales. Para validación consulte directamente con las dependencias correspondientes.
        </p>
      </Section>
    </>
  );
}
