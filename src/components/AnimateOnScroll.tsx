"use client";

import { useInView } from "@/hooks/useInView";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
  direction?: "up" | "fade" | "left" | "right";
  once?: boolean; // false = se revierte al salir del viewport
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
  once = true,
}: Props) {
  const { ref, inView } = useInView(0, once);

  const hiddenMap: Record<string, string> = {
    up:    "opacity-0 translate-y-4",
    fade:  "opacity-0",
    left:  "opacity-0 -translate-x-4",
    right: "opacity-0 translate-x-4",
  };

  const hidden = hiddenMap[direction] ?? "opacity-0";

  return (
    <div
      ref={ref}
      className={`transition-[transform,opacity] duration-500 ease-out ${inView ? "opacity-100 translate-y-0 translate-x-0" : `${hidden} will-change-transform`} ${className}`}
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
