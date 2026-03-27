"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// useLayoutEffect en browser, useEffect en SSR (evita warnings)
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Dispara `inView = true` la primera vez que el elemento entra en el viewport.
 * Para elementos ya visibles al cargar, la detección es síncrona (antes del
 * primer paint) para evitar el flash de contenido invisible.
 */
export function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Chequeo síncrono antes del primer paint — evita flash en elementos ya visibles
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setInView(true);
    }
  }, []);

  // Observer para elementos que entran al viewport al hacer scroll
  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, inView]);

  return { ref, inView };
}
