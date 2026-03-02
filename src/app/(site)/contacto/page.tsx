import type { Metadata } from "next";
import Image from "next/image";
import Section from "@/components/Section";
import ContactForm from "@/components/ContactForm";
import { siteContent } from "@/content/site";

export const metadata: Metadata = siteContent.contacto.meta;

export default function ContactoPage() {
  const { title, intro, info } = siteContent.contacto;

  const contactItems = [
    {
      icon: (
        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 py-7 sm:py-9">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-3">Habla con nosotros</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{title}</h1>
          <div className="mt-4 w-10 h-1 bg-emerald-600 rounded-full" />
        </div>
      </div>

      <Section>
        <p className="text-center text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-14 leading-relaxed">
          {intro}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Contact info */}
          <div>
            {/* Foto recepción */}
            <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100 mb-7">
              <Image
                src="/images/contacto.jpeg"
                alt="Recepción Baja Wastewater Solution"
                width={700}
                height={400}
                className="w-full h-48 object-cover"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-7">Información de contacto</h2>
            <ul className="space-y-5">
              {contactItems.map((item) => (
                <li key={item.label} className="flex gap-4">
                  <div className="w-11 h-11 bg-primary-50 border border-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-gray-800 font-medium hover:text-primary-600 transition-colors text-sm block"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-gray-800 font-medium text-sm">{item.value}</p>
                    )}
                    {item.extra && (
                      <a
                        href={item.extra.href}
                        className="text-gray-800 font-medium hover:text-primary-600 transition-colors text-sm block mt-0.5"
                      >
                        {item.extra.value}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-7 sm:p-9">
            <h2 className="text-xl font-bold text-gray-900 mb-7">Envíanos un mensaje</h2>
            <ContactForm />
          </div>
        </div>

        {/* Google Maps */}
        <div className="mt-14">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Cómo llegarnos</h2>
          <div className="rounded-2xl overflow-hidden shadow-md border border-gray-200 w-full h-80 sm:h-96">
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
        </div>
      </Section>
    </>
  );
}
