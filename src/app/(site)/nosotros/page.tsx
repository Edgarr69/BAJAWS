import type { Metadata } from "next";
import Image from "next/image";
import AnimateOnMount from "@/components/AnimateOnMount";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import FlotaGallery from "@/components/FlotaGallery";
import { siteContent } from "@/content/site";

export const metadata: Metadata = siteContent.nosotros.meta;

export default function NosotrosPage() {
  const { title, paragraphs, mision, vision } = siteContent.nosotros;

  return (
    <>
      {/* Encabezado */}
      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 py-4 sm:py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnMount direction="fade">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-2">Baja Wastewater Solution</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{title}</h1>
            <div className="mt-3 w-10 h-1 bg-emerald-600 rounded-full" />
          </AnimateOnMount>
        </div>
      </div>

      <section className="py-6 sm:py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Historia — texto + imagen, visibles sin scroll */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 items-start mb-8">

            <AnimateOnMount direction="left" delay={100} className="lg:col-span-3 space-y-4">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-gray-700 leading-relaxed text-base text-justify">
                  {p}
                </p>
              ))}
            </AnimateOnMount>

            <AnimateOnMount direction="right" delay={200} className="lg:col-span-2">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                <Image
                  src="/images/nosotros.png"
                  alt="Análisis de calidad del agua en laboratorio"
                  width={600}
                  height={600}
                  className="w-full h-56 lg:h-72 object-cover"
                  priority
                />
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                Monitoreo de calidad del agua en nuestras instalaciones
              </p>
            </AnimateOnMount>
          </div>

          {/* Separador — aparece al hacer scroll, se oculta al subir */}
          <AnimateOnScroll direction="fade" once={false} className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest bg-primary-50 border border-primary-100 px-3 py-1.5 rounded-full">
              Desde 2009
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </AnimateOnScroll>

          {/* Misión + Visión — animación al hacer scroll, se oculta al subir */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimateOnScroll direction="left" delay={50} once={false}>
              <div className="bg-primary-50 border border-primary-100 rounded-2xl p-7">
                <div className="w-10 h-10 bg-primary-200 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-primary-800 mb-3">{mision.title}</h2>
                <p className="text-gray-700 leading-relaxed text-sm text-justify">{mision.text}</p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll direction="right" delay={150} once={false}>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-7">
                <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-3">{vision.title}</h2>
                <p className="text-gray-700 leading-relaxed text-sm text-justify">{vision.text}</p>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Flota — galería */}
          <AnimateOnScroll direction="fade" once={false} className="mt-12">
            <div className="flex items-center gap-4 mb-7">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest bg-primary-50 border border-primary-100 px-3 py-1.5 rounded-full">
                Nuestra Flota
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <FlotaGallery />
          </AnimateOnScroll>

        </div>
      </section>
    </>
  );
}
