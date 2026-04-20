"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

// Intercaladas portrait/landscape para balance visual en columnas masonry
const IMAGES = [
  { n: 1,  w: 1200, h: 1600 }, // portrait
  { n: 7,  w: 1296, h: 972  }, // landscape
  { n: 2,  w: 960,  h: 1280 }, // portrait
  { n: 9,  w: 1600, h: 1204 }, // landscape
  { n: 3,  w: 1200, h: 1600 }, // portrait
  { n: 11, w: 1600, h: 900  }, // landscape
  { n: 8,  w: 1600, h: 1600 }, // cuadrada
  { n: 12, w: 1600, h: 1204 }, // landscape
  { n: 10, w: 960,  h: 1280 }, // portrait
  { n: 14, w: 1600, h: 1204 }, // landscape
  { n: 15, w: 1352, h: 918  }, // landscape
].map(({ n, w, h }) => ({
  src: `/galeria/${n}.webp`,
  alt: `Unidad Baja Wastewater Solution ${n}`,
  width: w,
  height: h,
}));
const images = IMAGES;

export default function FlotaGallery() {
  const [selected, setSelected]     = useState<number | null>(null);
  const [isClosing, setIsClosing]   = useState(false);
  const [imgKey, setImgKey]         = useState(0);
  const [direction, setDirection]   = useState<"next" | "prev">("next");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [visible, setVisible]       = useState(false);
  const [mounted, setMounted]       = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { rootMargin: "-40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Cierre con animación de salida
  const close = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setSelected(null);
      setIsClosing(false);
    }, 220);
  }, []);

  const prev = useCallback(() => {
    setDirection("prev");
    setImgKey((k) => k + 1);
    setSelected((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  }, []);

  const next = useCallback(() => {
    setDirection("next");
    setImgKey((k) => k + 1);
    setSelected((i) => (i !== null ? (i + 1) % images.length : null));
  }, []);

  useEffect(() => {
    if (selected === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")      close();
      if (e.key === "ArrowLeft")   prev();
      if (e.key === "ArrowRight")  next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, close, prev, next]);

  useEffect(() => {
    document.body.style.overflow = selected !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  return (
    <>
      {/* ── Masonry — CSS columns, cada foto a su proporción natural ── */}
      <div
        ref={ref}
        className="columns-2 md:columns-3 gap-3"
      >
        {images.map((img, i) => {
          const isHovered = hoveredIdx === i;

          return (
            <button
              key={i}
              className="break-inside-avoid mb-3 group relative overflow-hidden rounded-2xl border border-gray-100 cursor-pointer w-full text-left"
              style={{
                opacity:   visible ? 1 : 0,
                transform: visible
                  ? isHovered ? "translateY(-3px)" : "translateY(0)"
                  : "translateY(18px)",
                boxShadow: isHovered
                  ? "0 10px 28px rgba(11,60,93,0.13)"
                  : "0 1px 3px rgba(0,0,0,0.07)",
                transition: `opacity 0.55s ease ${i * 60}ms, transform 0.3s ease, box-shadow 0.3s ease`,
              }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => setSelected(i)}
              aria-label={`Ver foto ${i + 1} de la flota`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                className="w-full h-auto block transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 50vw, 33vw"
                priority={i < 3}
              />

              {/* Overlay hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 via-primary-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Ícono lupa */}
              <div aria-hidden="true" className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Lightbox — portal al body (evita bug de transform/fixed) ── */}
      {mounted && selected !== null && createPortal(
        <>
          {/* Backdrop con blur — difumina todo lo visible detrás */}
          <div
            className="fixed inset-0 z-40"
            style={{
              background: "rgba(8, 18, 35, 0.5)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              animation: isClosing
                ? "lb-bg-out 0.22s ease forwards"
                : "lb-bg-in 0.22s ease forwards",
            }}
            onClick={close}
          />

          {/* Ventana: centrada en el área BAJO el header (top: 4rem) */}
          <div
            className="fixed left-0 right-0 bottom-0 z-50 flex items-center justify-center gap-4 p-4 pointer-events-none"
            style={{ top: "var(--header-height, 4rem)" }}
          >
            {/* Flecha izquierda — fuera del modal */}
            <button
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 text-white backdrop-blur-sm transition-colors duration-150 pointer-events-auto"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Ver foto anterior de la flota"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div
              className="bg-white rounded-2xl overflow-hidden pointer-events-auto flex flex-col border border-gray-200"
              style={{
                maxWidth: "min(900px, 92vw)",
                maxHeight: "85vh",
                boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
                animation: isClosing
                  ? "lb-out 0.22s ease forwards"
                  : "lb-in 0.28s cubic-bezier(0.34,1.1,0.64,1) forwards",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Barra superior */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
                <span className="text-xs text-gray-400 tabular-nums select-none">
                  {selected + 1} / {images.length}
                </span>
                <button
                  className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                  onClick={(e) => { e.stopPropagation(); close(); }}
                  aria-label="Cerrar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Imagen — tamaño natural con máximos, ventana se adapta */}
              <div className="relative overflow-hidden">
                <div
                  key={imgKey}
                  style={{ animation: `lb-img-${direction} 0.4s cubic-bezier(0.25,0.46,0.45,0.94) forwards` }}
                >
                  <Image
                    src={images[selected].src}
                    alt={images[selected].alt}
                    width={images[selected].width}
                    height={images[selected].height}
                    className="block"
                    style={{
                      width: "auto",
                      height: "auto",
                      maxWidth: "min(900px, 92vw)",
                      maxHeight: "calc(85vh - 44px)",
                    }}
                    priority
                    sizes="(max-width: 768px) 92vw, 900px"
                  />
                </div>

              </div>
            </div>

            {/* Flecha derecha — fuera del modal */}
            <button
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 text-white backdrop-blur-sm transition-colors duration-150 pointer-events-auto"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Ver foto siguiente de la flota"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <style>{`
            @keyframes lb-bg-in  { from { opacity: 0; } to { opacity: 1; } }
            @keyframes lb-bg-out { from { opacity: 1; } to { opacity: 0; } }
            @keyframes lb-in  { from { opacity: 0; transform: scale(0.93) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            @keyframes lb-out { from { opacity: 1; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(0.93) translateY(8px); } }
            @keyframes lb-img-next { from { opacity: 0; transform: scale(0.96) translateX(16px); } to { opacity: 1; transform: scale(1) translateX(0); } }
            @keyframes lb-img-prev { from { opacity: 0; transform: scale(0.96) translateX(-16px); } to { opacity: 1; transform: scale(1) translateX(0); } }
          `}</style>
        </>,
        document.body
      )}
    </>
  );
}
