import type { Metadata } from "next";
import Image from "next/image";
import Section from "@/components/Section";
import AuthorizationsTable from "@/components/AuthorizationsTable";
import AnimateOnMount from "@/components/AnimateOnMount";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { siteContent } from "@/content/site";
import { getAdminClient } from "@/lib/supabase/admin";
import type { Autorizacion } from "@/types/panel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = siteContent.autorizaciones.meta;

const stats = [
  { value: "8",  label: "Autorizaciones vigentes" },
  { value: "5",  label: "Dependencias federales y estatales" },
  { value: "4",  label: "Modalidades de operación" },
  { value: "2009", label: "Año de inicio de operaciones" },
];

export default async function AutorizacionesPage() {
  const { title, intro } = siteContent.autorizaciones;

  const admin = getAdminClient();
  const { data } = await admin
    .from("autorizaciones")
    .select("id, clasificacion, dependencia, modalidad, residuo, numero_autorizacion, vigencia, display_order, created_at")
    .order("display_order");
  const rows: Autorizacion[] = data ?? [];

  return (
    <>
      {/* Encabezado */}
      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 py-4 sm:py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnMount direction="fade">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-2">Cumplimiento legal</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{title}</h1>
            <div className="mt-3 w-10 h-1 bg-emerald-600 rounded-full" />
          </AnimateOnMount>
        </div>
      </div>

      <Section>
        {/* Intro — texto + foto, visibles sin scroll */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 items-center mb-10">

          <AnimateOnMount direction="left" delay={100} className="lg:col-span-3">
            <p className="text-gray-600 text-base leading-relaxed text-justify">
              {intro}
            </p>
          </AnimateOnMount>

          <AnimateOnMount direction="right" delay={200} className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
              <Image
                src="/images/autorizaciones.jpg"
                alt="Autorizaciones oficiales de Baja Wastewater Solution"
                width={600}
                height={600}
                className="w-full h-56 lg:h-64 object-cover"
                priority
              />
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Autorizaciones físicas emitidas por CESPT, SEMAR y SEMARNAT
            </p>
          </AnimateOnMount>
        </div>

        {/* Stats — aparecen al hacer scroll */}
        <AnimateOnScroll direction="fade" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-primary-50 border border-primary-100 rounded-2xl p-5 text-center"
            >
              <p className="text-2xl sm:text-3xl font-extrabold text-primary-700 mb-1">{s.value}</p>
              <p className="text-xs text-gray-500 leading-snug">{s.label}</p>
            </div>
          ))}
        </AnimateOnScroll>

        {/* Tabla — aparece al hacer scroll, se oculta al subir */}
        <AnimateOnScroll direction="up" once={false}>
          <AuthorizationsTable rows={rows} />
        </AnimateOnScroll>

        <p className="mt-6 text-xs text-gray-400 text-center">
          Información vigente según registros oficiales. Para validación consulte directamente con las dependencias correspondientes.
        </p>
      </Section>
    </>
  );
}
