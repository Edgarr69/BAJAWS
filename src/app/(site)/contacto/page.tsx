import type { Metadata } from "next";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { siteContent } from "@/content/site";

export const metadata: Metadata = {
  ...siteContent.contacto.meta,
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function ContactoPage() {
  const { title, intro, info } = siteContent.contacto;

  const contactItems = [
    {
      icon: (
        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: "Dirección",
      value: info.direccion,
      href:  undefined,
      extra: undefined as { value: string; href: string } | undefined,
    },
    {
      icon: (
        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      label: "Teléfono",
      value: info.telefono,
      href:  `tel:${info.telefono.replace(/\D/g, "")}`,
      extra: undefined as { value: string; href: string } | undefined,
    },
    {
      icon: (
        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: "Correo",
      value: info.correo,
      href:  `mailto:${info.correo}`,
      extra: { value: info.correo2, href: `mailto:${info.correo2}` },
    },
    {
      icon: (
        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: "Horario",
      value: info.horario,
      href:  undefined,
      extra: undefined as { value: string; href: string } | undefined,
    },
  ];

  return (
    <>
      {/* Encabezado */}
      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 py-4 sm:py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll direction="fade">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-2">Habla con nosotros</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{title}</h1>
            <div className="mt-3 w-10 h-1 bg-emerald-600 rounded-full" />
          </AnimateOnScroll>
        </div>
      </div>

      <section className="py-5 sm:py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Intro */}
          <AnimateOnScroll direction="up" delay={50}>
            <p className="text-center text-gray-600 text-sm max-w-2xl mx-auto mb-5 leading-relaxed">
              {intro}
            </p>
          </AnimateOnScroll>

          {/* Grid principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-start">

            {/* Columna izquierda — imagen + info */}
            <AnimateOnScroll direction="left" delay={100}>
              <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100 mb-4">
                <Image
                  src="/images/contacto.jpeg"
                  alt="Recepción Baja Wastewater Solution"
                  width={700}
                  height={400}
                  className="w-full h-36 sm:h-48 md:h-60 object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
              <h2 className="text-base font-bold text-gray-900 mb-3">Información de contacto</h2>
              <ul className="space-y-2.5">
                {contactItems.map((item) => (
                  <li key={item.label} className="flex gap-3">
                    <div className="w-8 h-8 bg-primary-50 border border-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a href={item.href} className="text-gray-800 font-medium hover:text-primary-600 transition-colors text-sm block">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-gray-800 font-medium text-sm">{item.value}</p>
                      )}
                      {item.extra && (
                        <a href={item.extra.href} className="text-gray-800 font-medium hover:text-primary-600 transition-colors text-sm block mt-0.5">
                          {item.extra.value}
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>

            {/* Columna derecha — formulario */}
            <AnimateOnScroll direction="right" delay={200}>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
                <h2 className="text-base font-bold text-gray-900 mb-3">Envíanos un mensaje</h2>
                <ContactForm />
              </div>
            </AnimateOnScroll>
          </div>

          {/* Google Maps */}
          <AnimateOnScroll direction="up" className="mt-8">
            <h2 className="text-base font-bold text-gray-900 mb-3">Cómo llegarnos</h2>
            <div className="rounded-2xl overflow-hidden shadow-md border border-gray-200 w-full h-72 sm:h-80">
              <iframe
                title="Ubicación Baja Wastewater Solution"
                src="https://maps.google.com/maps?q=Fray+Junipero+Serra+17501,+Garita+de+Otay,+Tijuana,+Baja+California+22430,+Mexico&output=embed&hl=es&z=16"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href="https://maps.google.com/maps?q=Fray+Junipero+Serra+17501,+Garita+de+Otay,+Tijuana,+Baja+California+22430,+Mexico"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Abrir en Google Maps
            </a>
          </AnimateOnScroll>

        </div>
      </section>
    </>
  );
}
