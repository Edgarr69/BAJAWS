"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Dispara `inView` cuando el elemento entra/sale del viewport.
 * - once=false (default): bidireccional — oculta al subir, muestra al bajar.
 * - once=true: se queda visible tras la primera entrada.
 *
 * rootMargin:
 *   top  -40px → el elemento empieza a ocultarse mientras los últimos 40px
 *                aún son visibles (el usuario ve la animación de salida).
 *   bottom -30px → el elemento empieza a aparecer cuando 30px ya entraron
 *                  al viewport (sin zona muerta visible al fondo).
 */
export function useInView(
  threshold = 0,
  once = false,
  rootMargin = "-40px 0px -200px 0px",
) {
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
        rootMargin,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return { ref, inView };
}

/** rootMargin para páginas sin scroll (overflow-hidden): zona de detección más permisiva */
export const ROOT_MARGIN_FIXED = "-40px 0px -50px 0px";
