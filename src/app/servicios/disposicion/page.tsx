import type { Metadata } from "next";
import {
  ClipboardList, Search, Factory,
  Droplets, BadgeCheck, Lock,
} from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import AnimateOnMount from "@/components/AnimateOnMount";

export const metadata: Metadata = {
  title: "Proceso de Disposición | Baja Wastewater Solution",
  description:
    "Conoce nuestro proceso de disposición segura de residuos industriales: desde la recepción controlada hasta el confinamiento definitivo en celdas de seguridad.",
};

const steps = [
  {
    num: "01",
    title: "Recepción segura y controlada",
    description:
      "Gestión documental y perfilado de residuos previo a su ingreso a las instalaciones, garantizando trazabilidad completa desde el punto de origen.",
    Icon: ClipboardList,
    color: "emerald",
  },
  {
    num: "02",
    title: "Análisis de viabilidad",
    description:
      "Evaluación técnica de cada corriente para determinar su potencial de reciclaje o revalorización, maximizando el aprovechamiento con beneficio ambiental.",
    Icon: Search,
    color: "primary",
  },
  {
    num: "03",
    title: "Procesos en planta",
    description:
      "Determinación del tratamiento adecuado para cada residuo. Los materiales que requieren confinamiento se procesan para garantizar una disposición completamente segura.",
    Icon: Factory,
    color: "emerald",
  },
  {
    num: "04",
    title: "Tratamiento",
    description:
      "Estabilización y neutralización de materiales peligrosos con cero impacto ambiental. Cada cliente recibe un protocolo de tratamiento especializado y personalizado.",
    Icon: Droplets,
    color: "primary",
  },
  {
    num: "05",
    title: "Verificación",
    description:
      "Confirmación de la efectividad de los tratamientos aplicados. Los materiales que no cumplen especificaciones se retreatan hasta alcanzar los resultados requeridos.",
    Icon: BadgeCheck,
    color: "emerald",
  },
  {
    num: "06",
    title: "Celdas de seguridad",
    description:
      "Confinamiento permanente de residuos no valorizados en celdas diseñadas para evitar cualquier contacto con el entorno natural.",
    Icon: Lock,
    color: "primary",
  },
] as const;

type StepColor = "emerald" | "primary";

const colorMap: Record<StepColor, { icon: string; num: string }> = {
  emerald: {
    icon: "bg-emerald-600 text-white",
    num:  "text-emerald-600/[0.07]",
  },
  primary: {
    icon: "bg-primary-700 text-white",
    num:  "text-primary-700/[0.07]",
  },
};

const borderColor: Record<StepColor, string> = {
  emerald: "#059669",
  primary: "#0B3C5D",
};

function StepCard({ step, delay }: { step: typeof steps[number]; delay: number }) {
  const c = colorMap[step.color];
  return (
    <AnimateOnScroll delay={delay} direction="up" once={false}>
      <div
        className="group relative bg-white rounded-2xl border-t-4 shadow-sm hover:-translate-y-1.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.09)] transition-[transform,box-shadow] duration-[250ms] ease-out p-3 sm:p-5 h-full flex flex-col gap-2 sm:gap-3 overflow-hidden"
        style={{ borderTopColor: borderColor[step.color] }}
      >
        <span className={`absolute bottom-1 right-1 text-5xl sm:text-7xl font-black leading-none select-none pointer-events-none ${c.num}`}>
          {step.num}
        </span>
        <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110 flex-shrink-0 ${c.icon}`}>
          <step.Icon className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={1.75} />
        </div>
        <div className="relative z-10 flex flex-col gap-1">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">{step.title}</h3>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{step.description}</p>
        </div>
      </div>
    </AnimateOnScroll>
  );
}

export default function DisposicionPage() {
  return (
    <div className="flex flex-col bg-white md:overflow-hidden md:h-[calc(var(--dvh,100svh)-var(--header-height,4rem))]">

      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 py-4 sm:py-5 shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnMount direction="fade">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-2">Proceso de disposición</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Disposición de Residuos</h1>
            <div className="mt-3 w-10 h-1 bg-emerald-600 rounded-full" />
          </AnimateOnMount>
        </div>
      </div>

      <div className="flex-1 overflow-hidden py-4 sm:py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {steps.map((step, i) => (
              <StepCard key={step.num} step={step} delay={i * 60} />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
