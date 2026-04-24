"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Dispara `inView` cuando el elemento entra/sale del viewport.
 * - once=true (default): se queda visible tras la primera entrada.
 * - once=false: sigue el estado real de intersección (reversible).
 */
export function useInView(threshold = 0, once = true) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (once) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        } else {
          setInView(entry.isIntersecting);
        }
      },
      {
        threshold,
        rootMargin: "-30px 0px -80px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return { ref, inView };
}
