"use client";

import { useState } from "react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const faqs = [
  {
    pregunta: "¿Qué tipos de aguas residuales industriales tratan?",
    respuesta: "Tratamos aguas residuales con aceites, grasas, metales pesados, solventes y detergentes. Nuestros procesos incluyen separación físico-química, flotación por aire disuelto (DAF), neutralización y tratamiento biológico, adaptados a cada industria.",
  },
  {
    pregunta: "¿En qué zonas ofrecen el servicio?",
    respuesta: "Operamos en toda la región de Baja California: Tijuana, Tecate, Mexicali, Ensenada y zonas industriales adyacentes. Adicionalmente, brindamos servicio a nivel nacional para empresas que requieran atención en otros estados de la República Mexicana. Contamos con unidades propias de recolección y transporte.",
  },
  {
    pregunta: "¿Qué tipos de residuos manejan?",
    respuesta: "Manejamos aguas residuales industriales y residuos peligrosos sólidos, conforme a normativa vigente, minimizando el riesgo ambiental y operativo de tu empresa.",
  },
  {
    pregunta: "¿Cuánto tiempo toma obtener una cotización?",
    respuesta: "El proceso inicia con una visita técnica sin costo para evaluar el volumen, la composición del residuo y las condiciones del sitio. Con esa información elaboramos una cotización precisa que te entregamos en menos de 24 horas después de la visita técnica.",
  },
  {
    pregunta: "¿Qué documentación recibo después del tratamiento?",
    respuesta: "Al concluir cada servicio entregamos: manifiesto de entrega-recepción de residuos peligrosos, certificados de análisis fisicoquímicos y reportes a las autoridades según corresponda. Esto respalda tu cumplimiento normativo.",
  },
  {
    pregunta: "¿Con qué equipo de transporte cuentan para el traslado de residuos?",
    respuesta: "Contamos con una flota versátil que nos permite atender desde pequeños hasta grandes volúmenes, tanto de residuos líquidos como sólidos. Disponemos de pipas para traslado de líquidos, camiones tipo rabón y tractocamiones, todos con permisos vigentes para el manejo de residuos peligrosos.",
  },
  {
    pregunta: "¿Con qué frecuencia se realiza la recolección?",
    respuesta: "La frecuencia depende del volumen generado por tu proceso. Nos ajustamos a lo que necesite tu operación, incluyendo atención de emergencias fuera de calendario, para que tu producción no se detenga.",
  },
  {
    pregunta: "¿Por qué es importante contratar un prestador de servicios autorizado?",
    respuesta: "Las empresas generadoras están obligadas a entregar sus residuos peligrosos únicamente a prestadores con autorizaciones vigentes. Contratar un prestador no autorizado expone a tu empresa a multas, clausura, responsabilidad penal y pone en riesgo tu operación. Nuestras autorizaciones de SEMARNAT, CESPT y SCT garantizan pleno cumplimiento normativo.",
  },
];

function FaqItem({
  id,
  pregunta,
  respuesta,
  isOpen,
  onToggle,
}: {
  id: string;
  pregunta: string;
  respuesta: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const reduced = useReducedMotion();

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm"
        aria-expanded={isOpen}
        aria-controls={id}
      >
        <span className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-primary-700 transition-colors duration-150 leading-snug">
          {pregunta}
        </span>
        <svg
          className="flex-shrink-0 w-5 h-5 text-primary-600"
          style={{
            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
            transition: reduced ? "none" : "transform 0.35s cubic-bezier(0.34,1.08,0.64,1)",
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div
        id={id}
        className="grid"
        style={{
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transition: reduced ? "none" : isOpen
            ? "grid-template-rows 0.45s cubic-bezier(0.34,1.08,0.64,1)"
            : "grid-template-rows 0.3s ease",
        }}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-sm text-gray-600 leading-relaxed text-justify">{respuesta}</p>
        </div>
      </div>
    </div>
  );
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll direction="fade">
          <div className="text-center mb-6">
            <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              Resolvemos tus dudas
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-3">Preguntas frecuentes</h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
              Lo que las empresas generadoras preguntan antes de contratar nuestros servicios.
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={100}>
          <div>
            {faqs.map((faq, i) => (
              <FaqItem
                key={i}
                id={`faq-answer-${i}`}
                pregunta={faq.pregunta}
                respuesta={faq.respuesta}
                isOpen={openIndex === i}
                onToggle={() => toggle(i)}
              />
            ))}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
