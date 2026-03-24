import type { Metadata } from "next";
import {
  Users2, ClipboardList, TrendingUp, Layers,
  ShieldCheck, RefreshCcw, Award,
} from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import Section from "@/components/Section";

export const metadata: Metadata = {
  title: "Servicios Integrales | Baja Wastewater Solution",
  description:
    "Conoce nuestro proceso integral de gestión de residuos: desde el primer contacto hasta la mejora continua con estándares de calidad certificados.",
};

// Orden: inicio del proceso → ejecución/operación → beneficio, mejora y calidad
const steps = [
  {
    num: "01",
    title: "Primer contacto",
    description:
      "Buscamos las necesidades específicas de nuestros clientes; entendemos su proceso para después optimizarlo y realizar propuestas de mejora.",
    Icon: Users2,
    color: "emerald",
  },
  {
    num: "02",
    title: "Levantamiento",
    description:
      "Elaboramos el plan de manejo para cada corriente de residuos, maximizando la valorización y garantizando su disposición segura.",
    Icon: ClipboardList,
    color: "primary",
  },
  {
    num: "03",
    title: "Soluciones Integrales de Valor",
    description:
      "Ofrecemos soluciones completas con equipo especializado y personal in plant capacitado, administrado directamente por Baja Wastewater Solution.",
    Icon: Layers,
    color: "emerald",
  },
  {
    num: "04",
    title: "Disposición segura",
    description:
      "Contamos con plantas propias y autorizaciones vigentes para una disposición segura de residuos valorizables y no valorizables.",
    Icon: ShieldCheck,
    color: "primary",
  },
  {
    num: "05",
    title: "Mejora continua",
    description:
      "Identificamos formas innovadoras de gestionar residuos junto a nuestros clientes, maximizando rentabilidad y minimizando impacto ambiental.",
    Icon: RefreshCcw,
    color: "emerald",
  },
  {
    num: "06",
    title: "Estándares de calidad",
    description:
      "Aplicamos nuestras certificaciones a cada proceso, garantizando calidad y cubriendo las necesidades particulares de cada cliente.",
    Icon: Award,
    color: "primary",
  },
  {
    num: "07",
    title: "Cadena de valor altamente rentable",
    description:
      "Nuestros socios estratégicos garantizan el mayor retorno económico de los residuos valorizables para cada cliente.",
    Icon: TrendingUp,
    color: "emerald",
  },
] as const;

type StepColor = "emerald" | "primary";

const colorMap: Record<StepColor, { icon: string; num: string; dot: string; line: string }> = {
  emerald: {
    icon: "bg-emerald-600 text-white",
    num:  "text-emerald-600/[0.07]",
    dot:  "bg-emerald-500",
    line: "border-emerald-200",
  },
  primary: {
    icon: "bg-primary-700 text-white",
    num:  "text-primary-700/[0.07]",
    dot:  "bg-primary-600",
    line: "border-primary-200",
  },
};

function StepCard({ step, delay }: { step: typeof steps[number]; delay: number }) {
  const c = colorMap[step.color];
  return (
    <AnimateOnScroll delay={delay} direction="up">
      <div
        className="group relative bg-white rounded-2xl border-t-4 shadow-sm hover:-translate-y-1.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.09)] transition-all duration-[250ms] ease-out p-4 sm:p-5 h-full flex flex-col gap-3 overflow-hidden"
        style={{ borderTopColor: step.color === 'emerald' ? '#059669' : '#0B3C5D' }}
      >
        {/* Número como marca de agua en esquina */}
        <span className={`absolute bottom-1 right-2 text-7xl font-black leading-none select-none pointer-events-none ${c.num}`}>
          {step.num}
        </span>

        {/* Ícono */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110 flex-shrink-0 ${c.icon}`}>
          <step.Icon className="w-5 h-5" strokeWidth={1.75} />
        </div>

        {/* Texto */}
        <div className="relative z-10 flex flex-col gap-1">
          <h3 className="font-bold text-slate-800 text-sm leading-snug">
            {step.title}
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>
    </AnimateOnScroll>
  );
}

export default function ServiciosIntegralesPage() {
  return (
    <div className="bg-slate-50 min-h-[calc(100svh-4rem)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Encabezado compacto */}
        <div className="mb-5 sm:mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-1">
            Proceso de gestión
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Servicios Integrales</h1>
          <div className="mt-3 w-8 h-1 bg-emerald-600 rounded-full" />
        </div>

        {/* Fila 1 — 4 cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {steps.slice(0, 4).map((step, i) => (
            <StepCard key={step.num} step={step} delay={i * 80} />
          ))}
        </div>

        {/* Fila 2 — 3 cards centradas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4 sm:w-3/4 mx-auto">
          {steps.slice(4).map((step, i) => (
            <StepCard key={step.num} step={step} delay={(i + 4) * 80} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-6 sm:mt-8">
          <AnimateOnScroll direction="fade" delay={200}>
            <div className="bg-gradient-to-br from-primary-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-center">
              <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest mb-2">
                Nuestro compromiso
              </p>
              <h2 className="text-white text-lg sm:text-2xl font-extrabold mb-2 leading-tight">
                Economía circular con cumplimiento total
              </h2>
              <p className="text-white/60 text-sm max-w-xl mx-auto leading-relaxed mb-5">
                Integramos cada etapa del proceso para que tus residuos generen el mayor
                valor posible con el mínimo impacto ambiental, respaldados por todas
                nuestras autorizaciones vigentes.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="/#cotizacion"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors duration-200 text-sm"
                >
                  Solicitar diagnóstico
                </a>
                <a
                  href="/servicios"
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors duration-200 text-sm"
                >
                  Ver todos los servicios
                </a>
              </div>
            </div>
          </AnimateOnScroll>
        </div>

      </div>
    </div>
  );
}
