"use client";

import { useInView } from "@/hooks/useInView";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
  direction?: "up" | "fade" | "left" | "right";
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
}: Props) {
  const { ref, inView } = useInView();

  const hiddenMap: Record<string, string> = {
    up:    "opacity-0 translate-y-8",
    fade:  "opacity-0",
    left:  "opacity-0 -translate-x-8",
    right: "opacity-0 translate-x-8",
  };

  const hidden = hiddenMap[direction] ?? "opacity-0";

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${inView ? "opacity-100 translate-y-0 translate-x-0" : hidden} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
