import type { Metadata } from "next";
import Link from "next/link";
import Section from "@/components/Section";
import ServiceCard from "@/components/ServiceCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import ContactForm from "@/components/ContactForm";
import YoutubeEmbed from "@/components/YoutubeEmbed";
import HeroContent from "@/components/HeroContent";
import HeroVideo from "@/components/HeroVideo";
import FaqSection from "@/components/FaqSection";
import { siteContent, getYearsExperience } from "@/content/site";
import { getAdminClient } from "@/lib/supabase/admin";

export const revalidate = 3600;
export const metadata: Metadata = {
  ...siteContent.home.meta,
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

const razones = [
  {
    titulo:     "Cumplimiento normativo garantizado",
    descripcion:"Autorizaciones vigentes ante SEMARNAT, CESPT, SEMAR y SCT — sin riesgo de clausura para tu empresa.",
  },
  {
    titulo:     `${getYearsExperience()}+ años de trayectoria`,
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


export default async function HomePage() {
  const services             = siteContent.services.items.slice(0, 3) as { id: string; title: string; description: string; icon: 'truck' | 'water' | 'warehouse' }[];
  const yearsExperience      = getYearsExperience();
  const servicesCount        = services.length;
  const agencias             = siteContent.landing.autorizaciones.items;

  const admin = getAdminClient();
  const { count } = await admin
    .from("autorizaciones")
    .select("id", { count: "exact", head: true });
  const authorizationsCount = count ?? 0;

  return (
    <>
      {/* ── Hero Split ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden flex flex-col" style={{ height: 'calc(min(var(--dvh, 100svh), 100svh) - var(--header-height, 4rem))' }}>

        <HeroVideo />
        {/* Overlay para legibilidad del texto */}
        <div className="absolute inset-0 bg-black/40 z-0" />

        {/* Degradado inferior: funde el video con el HeroStats sin corte visible */}
        <div className="absolute inset-x-0 bottom-0 h-40 z-[1] pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(7,30,48,0.65))' }}
        />

        <HeroContent yearsExperience={yearsExperience} authorizationsCount={authorizationsCount} />
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
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
            <YoutubeEmbed
              videoId="UyetZ7i_Mg4"
              title="Baja Wastewater Solution — Video institucional"
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
                <div className="bg-white/8 border border-white/15 rounded-2xl p-5 hover:bg-white/15 hover:border-secondary-400/30 transition-[background-color,border-color] duration-300 h-full">
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
      <section id="cotizacion" className="bg-gray-50 scroll-mt-16 min-h-[calc(100svh-4rem)] flex items-center">
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <AnimateOnScroll direction="fade">
            <div className="text-center mb-5">
              <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3 uppercase tracking-wider">
                Respuesta en menos de 24 horas
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Solicita tu Asesoría Técnica
              </h2>
              <p className="text-gray-500 text-sm">
                Nuestro equipo especializado analizará tu caso y te presentará la mejor solución para tu industria.
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={100}>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-7">
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

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <FaqSection />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": siteContent.company.name,
            "telephone": siteContent.contacto.info.telefono,
            "url": "https://bajaws.mx",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": siteContent.contacto.info.direccion,
              "addressLocality": "Tijuana",
              "addressRegion": "Baja California",
              "postalCode": "22430",
              "addressCountry": "MX"
            }
          })
        }}
      />
    </>
  );
}
