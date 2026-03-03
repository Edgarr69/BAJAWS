import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Section from "@/components/Section";
import ServiceCard from "@/components/ServiceCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import ContactForm from "@/components/ContactForm";
import { siteContent, getYearsExperience } from "@/content/site";

export const metadata: Metadata = siteContent.home.meta;

const razones = [
  {
    titulo:     "Cumplimiento normativo garantizado",
    descripcion:"Autorizaciones vigentes ante SEMARNAT, CESPT, SEMAR y SCT — sin riesgo de clausura para tu empresa.",
  },
  {
    titulo:     "17+ años de trayectoria",
    descripcion:"Desde 2009 apoyando a industrias de alto perfil en Baja California con resultados comprobados.",
  },
  {
    titulo:     "Monitoreo continuo de calidad",
    descripcion:"Análisis fisicoquímicos periódicos que garantizan la eficiencia real de cada proceso de tratamiento.",
  },
  {
    titulo:     "Servicio 100 % integral",
    descripcion:"Recolección, transporte, acopio y tratamiento en un solo proveedor — sin intermediarios.",
  },
];


export default function HomePage() {
  const services             = siteContent.services.items;
  const yearsExperience      = getYearsExperience();
  const authorizationsCount  = siteContent.autorizaciones.rows.length;
  const servicesCount        = services.length;
  const agencias             = siteContent.landing.autorizaciones.items;

  return (
    <>
      {/* ── Hero Split ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden flex flex-col h-[calc(100vh-4rem)]">

        {/* Video de fondo — reemplaza imagen marítima */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <source src="/videos/laboratorio.mp4" type="video/mp4" />
          <source src="/videos/laboratorio.mov" type="video/quicktime" />
        </video>
        {/* Overlay para legibilidad del texto */}
        <div className="absolute inset-0 bg-black/40 z-0" />

        {/* Contenido */}
        <div className="relative z-10 flex flex-1 items-center px-8 sm:px-12 lg:px-20 py-10 min-h-0">
          <div className="max-w-2xl">

            {/* Eyebrow — nombre de empresa */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-teal-300 text-xs font-bold tracking-[0.25em] uppercase">
                Baja Wastewater Solutions
              </span>
              <span className="h-px w-12 bg-teal-400/60" />
            </div>

            {/* Titular */}
            <h1 className="font-extrabold leading-[1.1] tracking-tight mb-5 text-white text-[2rem] sm:text-[2.8rem] lg:text-[3rem] xl:text-[3.4rem]">
              Soluciones integrales en
              <span className="block text-teal-300 mt-1">
                manejo de líquidos peligrosos
              </span>
            </h1>

            {/* Divisor decorativo */}
            <div className="w-14 h-[3px] bg-teal-400 rounded-full mb-6" />

            {/* Subtítulo */}
            <p className="text-white/75 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              Diseñamos, implementamos y operamos sistemas de tratamiento con
              enfoque ambiental, eficiencia operativa y cumplimiento normativo.
            </p>

            {/* Autorizaciones — fila con iconos */}
            <div className="flex items-center gap-x-4 flex-wrap gap-y-2 mb-9">
              {['SEMARNAT', 'CESPT', 'SEMAR', 'SCT'].map((org, i) => (
                <div key={org} className="flex items-center gap-x-3">
                  {i > 0 && <span className="w-px h-3.5 bg-white/20 flex-shrink-0" />}
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-[11px] font-semibold text-white/75 tracking-wider">{org}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="#cotizacion"
                className="inline-block bg-teal-600 hover:bg-teal-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-lg"
              >
                Solicitar cotización
              </Link>
              <Link
                href="/servicios"
                className="inline-block bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl border border-white/25 transition-all duration-200 active:scale-[0.98]"
              >
                Ver servicios →
              </Link>
            </div>
          </div>
        </div>

        {/* Barra de estadísticas — glassmorphism */}
        <div
          className="relative z-10 text-white"
          style={{
            backdropFilter: "blur(8px) saturate(140%)",
            WebkitBackdropFilter: "blur(8px) saturate(140%)",
            backgroundColor: "rgba(7,30,48,0.72)",
            borderTop: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
          }}
        >
          <div className="grid grid-cols-3">
            <div className="py-5 px-4 sm:px-10 text-center" style={{ borderRight: "1px solid rgba(255,255,255,0.12)" }}>
              <p className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">{yearsExperience}+</p>
              <p className="text-white/60 text-xs mt-1 tracking-wide uppercase">Años de experiencia</p>
            </div>
            <div className="py-5 px-4 sm:px-10 text-center" style={{ borderRight: "1px solid rgba(255,255,255,0.12)" }}>
              <p className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">{authorizationsCount}</p>
              <p className="text-white/60 text-xs mt-1 tracking-wide uppercase">Autorizaciones vigentes</p>
            </div>
            <div className="py-5 px-4 sm:px-10 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">100%</p>
              <p className="text-white/60 text-xs mt-1 tracking-wide uppercase">Cumplimiento ambiental</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Servicios ────────────────────────────────────────────────────────── */}
      <Section className="py-20">
        <AnimateOnScroll direction="fade">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              Soluciones integrales
            </span>
            <h2 className="section-title mb-3">Nuestros Servicios</h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
              {siteContent.services.intro}
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, i) => (
            <AnimateOnScroll key={service.id} delay={i * 130}>
              <ServiceCard
                title={service.title}
                description={service.description}
                icon={service.icon}
              />
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll direction="fade" delay={200} className="text-center mt-10">
          <Link href="/servicios" className="btn-primary text-sm">
            Ver todos los servicios →
          </Link>
        </AnimateOnScroll>
      </Section>

      {/* ── Por qué elegirnos ────────────────────────────────────────────────── */}
      <Section className="bg-gray-50 py-20">
        <AnimateOnScroll direction="fade">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              Ventajas competitivas
            </span>
            <h2 className="section-title mb-3">¿Por qué elegirnos?</h2>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {razones.map((r, i) => (
            <AnimateOnScroll key={i} delay={i * 100}>
              <div className="flex gap-4 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1.5 text-sm leading-snug">{r.titulo}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{r.descripcion}</p>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </Section>

      {/* ── Video institucional ──────────────────────────────────────────────── */}
      <Section className="py-20">
        <AnimateOnScroll direction="fade">
          <div className="text-center mb-10">
            <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              Nuestras instalaciones
            </span>
            <h2 className="section-title mb-3">Conócenos</h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              Descubre nuestras instalaciones y el trabajo que hacemos día a día.
            </p>
          </div>
        </AnimateOnScroll>
        <AnimateOnScroll delay={150}>
          <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gray-200 aspect-video">
            <iframe
              src="https://www.youtube-nocookie.com/embed/UyetZ7i_Mg4?rel=0&modestbranding=1"
              title="Baja Wastewater Solution — Video institucional"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </AnimateOnScroll>
      </Section>

      {/* ── Autorizaciones ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimateOnScroll direction="fade">
            <span className="inline-block bg-white/10 border border-white/15 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
              Respaldo legal
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Operamos con todas las autorizaciones vigentes
            </h2>
            <p className="text-slate-400 mb-10 text-sm max-w-xl mx-auto">
              Cumplimos con todos los requisitos legales para operar en Baja California a nivel federal y estatal.
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {agencias.map((a, i) => (
              <AnimateOnScroll key={a.dependencia} delay={i * 100}>
                <div className="bg-white/8 border border-white/15 rounded-2xl p-5 hover:bg-white/15 hover:border-secondary-400/30 transition-all duration-300 h-full">
                  <p className="text-secondary-300 font-bold text-xl mb-2">{a.dependencia}</p>
                  <p className="text-slate-300 text-xs leading-relaxed">{a.descripcion}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll direction="fade" delay={300} className="mt-10">
            <Link
              href="/autorizaciones"
              className="inline-block text-slate-300 hover:text-white border border-white/20 hover:border-white/40 px-6 py-2.5 rounded-lg text-sm transition-colors duration-200"
            >
              Ver todas las certificaciones →
            </Link>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Cotización ───────────────────────────────────────────────────────── */}
      <section id="cotizacion" className="py-24 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll direction="fade">
            <div className="text-center mb-10">
              <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
                Respuesta en menos de 24 horas
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Solicita tu Asesoría Técnica
              </h2>
              <p className="text-gray-500 text-base">
                Nuestro equipo especializado analizará tu caso y te presentará la mejor solución para tu industria.
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={100}>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
              <ContactForm ctaLabel="Solicitar Asesoría Técnica" source="cotizacion" />
            </div>

            <p className="text-center text-xs text-gray-400 mt-5">
              También puedes llamarnos directamente:{" "}
              <a
                href={`tel:${siteContent.contacto.info.telefono.replace(/\D/g, "")}`}
                className="text-primary-600 font-medium hover:underline"
              >
                {siteContent.contacto.info.telefono}
              </a>
            </p>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
