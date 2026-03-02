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
      <section className="relative overflow-hidden flex flex-col min-h-[calc(100vh-4rem)]">

        {/* Imagen marítima — fondo de todo el hero + stats */}
        <Image
          src="/images/maritimaa.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        {/* Overlay muy sutil — deja el mar visible */}
        <div className="absolute inset-0 bg-black/10" />

        {/* Grid principal — ocupa el espacio sobrante */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[60%_40%] flex-1">

          {/* Panel izquierdo — texto */}
          <div className="relative flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-24 lg:py-0">
            {/* Gradiente claro para legibilidad del texto oscuro */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/55 via-white/30 to-transparent pointer-events-none" />
            {/* Fade derecho — disuelve el panel hacia el fondo marino */}
            <div className="absolute inset-y-0 right-0 w-32 pointer-events-none hidden lg:block"
              style={{ background: "linear-gradient(to left, rgba(7,30,48,0.35) 0%, transparent 100%)" }} />
            <div className="relative z-10 max-w-xl">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/15 border border-primary-300/40 text-primary-900 text-xs font-medium px-4 py-2 rounded-full mb-8">
                <svg className="w-3.5 h-3.5 text-primary-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Empresa autorizada · SEMARNAT · CESPT · SEMAR · SCT
              </div>

              {/* Titular */}
              <h1 className="font-extrabold leading-[1.15] tracking-tight mb-6 text-gray-900 text-[1.9rem] sm:text-[2.4rem] lg:text-[2.2rem] xl:text-[2.7rem]">
                <span className="block">Una empresa de soluciones en</span>
                <span className="block text-teal-700">manejo de líquidos peligrosos</span>
              </h1>

              {/* Subtítulo */}
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-10">
                Diseñamos, implementamos y operamos sistemas de tratamiento con
                enfoque ambiental, eficiencia operativa y cumplimiento normativo.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="#cotizacion"
                  className="inline-block bg-teal-700 hover:bg-teal-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md"
                >
                  Solicitar cotización
                </Link>
                <Link
                  href="/servicios"
                  className="inline-block bg-white/50 hover:bg-white/70 text-gray-800 font-semibold px-6 py-3 rounded-lg border border-gray-600 transition-all duration-200 active:scale-[0.98]"
                >
                  Ver servicios →
                </Link>
              </div>
            </div>
          </div>

          {/* Panel derecho — foto del edificio */}
          <div className="relative min-h-[55vw] lg:min-h-0">
            <Image
              src="/images/planta-exterior.jpeg"
              alt="Instalaciones Baja Wastewater Solution"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
              priority
            />
            {/* Fade superior */}
            <div className="absolute inset-x-0 top-0 h-16 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to bottom, rgba(7,30,48,0.3) 0%, transparent 100%)" }} />
            {/* Fade inferior */}
            <div className="absolute inset-x-0 bottom-0 h-20 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(7,30,48,0.4) 0%, transparent 100%)" }} />
            {/* Fade derecho */}
            <div className="absolute inset-y-0 right-0 w-16 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to left, rgba(7,30,48,0.25) 0%, transparent 100%)" }} />
            {/* Fade izquierdo — transición suave entre paneles */}
            <div
              className="absolute inset-y-0 left-0 z-10 pointer-events-none hidden lg:block"
              style={{
                width: "72px",
                background: "linear-gradient(to right, rgba(7,30,48,0.22) 0%, transparent 100%)",
              }}
            />
          </div>
        </div>

        {/* Barra de estadísticas — glass transparente, mar de fondo */}
        <div
          className="relative z-10 border-t border-white/20 text-white"
          style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", backgroundColor: "rgba(7,30,48,0.45)" }}
        >
          {/* Grid full-width para que el divisor de 100% quede alineado con el borde de la foto */}
          <div className="grid grid-cols-3 lg:grid-cols-[30%_30%_40%]">
            <div className="py-3 px-4 sm:px-8 text-center border-r border-white/10">
              <p className="text-2xl sm:text-3xl font-bold text-white">{yearsExperience}+</p>
              <p className="text-primary-200 text-xs mt-0.5">Años de experiencia</p>
            </div>
            <div className="py-3 px-4 sm:px-8 text-center border-r border-white/10">
              <p className="text-2xl sm:text-3xl font-bold text-white">{authorizationsCount}</p>
              <p className="text-primary-200 text-xs mt-0.5">Autorizaciones vigentes</p>
            </div>
            <div className="py-3 px-4 sm:px-8 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">100%</p>
              <p className="text-primary-200 text-xs mt-0.5">Cumplimiento ambiental</p>
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
              <ContactForm ctaLabel="Solicitar Asesoría Técnica" />
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
