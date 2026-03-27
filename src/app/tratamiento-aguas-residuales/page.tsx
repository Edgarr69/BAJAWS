import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { siteContent } from "@/content/site";

export const metadata: Metadata = siteContent.landing.meta;

export default function LandingPage() {
  const { hero, problema, solucion, beneficios, autorizaciones, formulario } =
    siteContent.landing;
  const { name } = siteContent.company;
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Minimal Header ─────────────────────────────────────────────────── */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logoo.webp"
              alt="Baja Wastewater Solution"
              width={160}
              height={62}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
          <a
            href="#cotizacion"
            className="bg-primary-700 hover:bg-primary-600 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors duration-200"
          >
            Solicitar cotización
          </a>
        </div>
      </header>

      <main className="flex-1">

        {/* ── HERO con video de fondo ───────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-primary-900 text-white py-24 sm:py-32">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/recepcion.mov" type="video/mp4" />
            <source src="/videos/recepcion.mov" type="video/quicktime" />
          </video>
          <div className="absolute inset-0 bg-black/65" />

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-secondary-200 text-xs sm:text-sm font-medium px-4 py-2 rounded-full mb-8">
              <svg className="w-4 h-4 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {hero.badge}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
              {hero.title}
            </h1>

            <p className="text-primary-100 text-lg sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
              {hero.subtitle}
            </p>

            <a
              href={hero.ctaHref}
              className="inline-block bg-white text-primary-700 hover:bg-primary-50 font-bold px-10 py-4 rounded-xl text-lg transition-colors duration-200 shadow-xl shadow-primary-900/30"
            >
              {hero.cta}
            </a>
          </div>
        </section>

        {/* ── PROBLEMA ─────────────────────────────────────────────────────── */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimateOnScroll direction="fade">
              <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">
                {problema.title}
              </h2>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {problema.items.map((item, i) => (
                <AnimateOnScroll key={i} delay={i * 130}>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 hover:shadow-md transition-shadow h-full">
                    <div className="w-11 h-11 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center mb-5">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-base">{item.titulo}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.descripcion}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ── SOLUCIÓN ─────────────────────────────────────────────────────── */}
        <section className="py-20 bg-primary-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimateOnScroll direction="fade">
              <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-7 h-7 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 2C8.686 2 6 7.373 6 11a6 6 0 0012 0c0-3.627-2.686-9-6-9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 13a3 3 0 006 0" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">{solucion.title}</h2>
              <p className="text-primary-100 text-lg leading-relaxed">{solucion.description}</p>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ── BENEFICIOS ───────────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimateOnScroll direction="fade">
              <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">
                {beneficios.title}
              </h2>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 max-w-4xl mx-auto">
              {beneficios.items.map((item, i) => (
                <AnimateOnScroll key={i} delay={i * 100}>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-6 h-6 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1.5 text-base">{item.titulo}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.descripcion}</p>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ── AUTORIZACIONES ───────────────────────────────────────────────── */}
        <section className="py-20 bg-slate-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimateOnScroll direction="fade">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">{autorizaciones.title}</h2>
              <p className="text-slate-400 mb-10 text-sm">
                Cumplimos con todos los requisitos legales para operar en Baja California.
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {autorizaciones.items.map((item, i) => (
                <AnimateOnScroll key={i} delay={i * 100}>
                  <div className="bg-white/8 border border-white/15 rounded-2xl p-5 hover:bg-white/15 hover:border-secondary-400/30 transition-all duration-300 h-full">
                    <p className="text-secondary-300 font-bold text-xl mb-2">{item.dependencia}</p>
                    <p className="text-slate-300 text-xs leading-relaxed">{item.descripcion}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ── FORMULARIO CTA ───────────────────────────────────────────────── */}
        <section id="cotizacion" className="py-24 bg-gray-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimateOnScroll direction="fade">
              <div className="text-center mb-10">
                <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
                  Respuesta en menos de 24 horas
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  {formulario.title}
                </h2>
                <p className="text-gray-500 text-base">{formulario.subtitle}</p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={100}>
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
                <ContactForm ctaLabel={formulario.cta} source="cotizacion" />
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
      </main>

      {/* ── Minimal Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 py-7 text-center">
        <p className="text-gray-500 text-sm">
          © {year} {name}. Todos los derechos reservados.
        </p>
        <p className="text-gray-600 text-xs mt-1">
          <Link href="/" className="hover:text-gray-400 transition-colors">Sitio corporativo</Link>
          {" · "}
          <Link href="/autorizaciones" className="hover:text-gray-400 transition-colors">Certificaciones</Link>
          {" · "}
          <Link href="/contacto" className="hover:text-gray-400 transition-colors">Contacto</Link>
        </p>
      </footer>
    </div>
  );
}
