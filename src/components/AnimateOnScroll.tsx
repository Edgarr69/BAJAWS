"use client";

import { useInView } from "@/hooks/useInView";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
  direction?: "up" | "fade" | "left" | "right";
  once?: boolean; // true = queda visible tras la primera entrada
}

/**
 * Envuelve contenido con una animación de entrada al hacer scroll.
 * "up"    → sube mientras aparece (fade-in + slide-up)
 * "fade"  → solo fade-in
 * "left"  → entra desde la izquierda
 * "right" → entra desde la derecha
 */
export default function AnimateOnScroll({
  children,
  className = "",
  delay = 0,
  direction = "up",
  once = false,
}: Props) {
  const { ref, inView } = useInView(0, once);

  const hiddenMap: Record<string, string> = {
    up:    "motion-safe:opacity-0 motion-safe:translate-y-4",
    fade:  "motion-safe:opacity-0",
    left:  "motion-safe:opacity-0 motion-safe:-translate-x-4",
    right: "motion-safe:opacity-0 motion-safe:translate-x-4",
  };

  const hidden = hiddenMap[direction] ?? "motion-safe:opacity-0";

  return (
    <div
      ref={ref}
      className={`motion-safe:transition-[transform,opacity] motion-safe:duration-500 motion-safe:ease-out ${inView ? "opacity-100 translate-y-0 translate-x-0" : `${hidden} motion-safe:will-change-transform`} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      onTransitionEnd={(e) => {
        if (e.propertyName === "opacity") {
          (e.currentTarget as HTMLDivElement).style.willChange = "auto";
        }
      }}
    >
      {children}
    </div>
  );
}
