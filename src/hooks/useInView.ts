"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Dispara `inView = true` la primera vez que el elemento entra en el viewport.
 * Se desconecta tras la primera detección para no re-animar al hacer scroll.
 */
export function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
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
  }, [threshold]);

  return { ref, inView };
}
