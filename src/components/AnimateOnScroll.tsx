"use client";

import { useInView } from "@/hooks/useInView";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
  direction?: "up" | "fade" | "left" | "right";
  once?: boolean; // true = queda visible tras la primera entrada
  rootMargin?: string; // override de zona de detección
}

export default function AnimateOnScroll({
  children,
  className = "",
  delay = 0,
  direction = "up",
  once = false,
  rootMargin,
}: Props) {
  const { ref, inView } = useInView(0, once, rootMargin);

  // opacity-0 (sin motion-safe) garantiza que el elemento SIEMPRE esté oculto
  // cuando no está en el viewport, independientemente de prefers-reduced-motion.
  // Los transforms y la transición sí usan motion-safe para respetar la preferencia.
  const hiddenMap: Record<string, string> = {
    up:    "opacity-0 motion-safe:translate-y-5",
    fade:  "opacity-0",
    left:  "opacity-0 motion-safe:-translate-x-5",
    right: "opacity-0 motion-safe:translate-x-5",
  };

  const hidden = hiddenMap[direction] ?? "opacity-0";

  return (
    <div
      ref={ref}
      className={`
        motion-safe:transition-[transform,opacity]
        motion-safe:duration-500
        motion-safe:ease-out
        ${inView
          ? "opacity-100 translate-y-0 translate-x-0"
          : hidden
        }
        ${className}
      `}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
