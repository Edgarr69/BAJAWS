"use client";

import { useState } from "react";
import AnimateOnScroll from "@/components/AnimateOnScroll";

const faqs = [
  {
    pregunta: "¿Qué tipos de aguas residuales industriales tratan?",
    respuesta:
      "Tratamos aguas residuales con aceites, grasas, metales pesados, solventes, detergentes y otros contaminantes industriales. Nuestros procesos incluyen separación físico-química, flotación por aire disuelto (DAF), neutralización y tratamiento biológico, adaptados al perfil de cada industria.",
  },
  {
    pregunta: "¿En qué zonas de Baja California ofrecen el servicio?",
    respuesta:
      "Cubrimos toda la región de Baja California: Tijuana, Tecate, Mexicali, Ensenada y zonas industriales adyacentes. Contamos con unidades propias de recolección y transporte con permisos vigentes de la SCT para el manejo de residuos peligrosos.",
  },
  {
    pregunta: "¿Cuánto tiempo toma obtener una cotización?",
    respuesta:
      "Respondemos en menos de 24 horas hábiles. Una vez que recibes la cotización, podemos coordinar una visita técnica sin costo para evaluar el volumen, la composición del residuo y definir la frecuencia óptima del servicio.",
  },
  {
    pregunta: "¿Qué documentación recibo después del tratamiento?",
    respuesta:
      "Al concluir cada servicio emitimos un manifiesto de entrega-recepción de residuos peligrosos, certificados de análisis fisicoquímicos y, cuando aplica, reportes a las autoridades competentes. Esta documentación protege a tu empresa ante auditorías de SEMARNAT o CESPT.",
  },
  {
    pregunta: "¿Con qué frecuencia se realiza la recolección?",
    respuesta:
      "La frecuencia depende del volumen generado por tu proceso. Podemos programar servicios semanales, quincenales o mensuales, así como atención de emergencias fuera de calendario cuando se requiera.",
  },
  {
    pregunta: "¿Por qué es importante contratar un tratador autorizado por SEMARNAT?",
    respuesta:
      "La ley obliga a las empresas generadoras a entregar sus residuos peligrosos únicamente a empresas con autorización federal vigente. Contratar un prestador no autorizado expone a tu empresa a multas, clausura y responsabilidad penal. Nuestras autorizaciones de SEMARNAT, CESPT, SEMAR y SCT garantizan pleno cumplimiento normativo.",
  },
];

function FaqItem({
  pregunta,
  respuesta,
  isOpen,
  onToggle,
}: {
  pregunta: string;
  respuesta: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-primary-700 transition-colors duration-150 leading-snug">
          {pregunta}
        </span>
        <svg
          className="flex-shrink-0 w-5 h-5 text-primary-600"
          style={{
            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.35s cubic-bezier(0.34,1.08,0.64,1)",
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div
        className="grid"
        style={{
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transition: isOpen
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
