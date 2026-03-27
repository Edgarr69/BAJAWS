"use client";

import { useEffect, useRef } from "react";

// Elimina el corte negro en el loop regresando al inicio 0.3s antes del final
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    const handleTimeUpdate = () => {
      if (v.duration && v.currentTime >= v.duration - 0.3) {
        v.currentTime = 0;
      }
    };

    v.addEventListener("timeupdate", handleTimeUpdate);
    return () => v.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      ref={ref}
      className="absolute inset-0 w-full h-full object-cover z-0"
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      style={{ backfaceVisibility: "hidden" }}
    >
      <source src="/videos/laboratorio.webm" type="video/webm" />
      <source src="/videos/laboratorio.mp4" type="video/mp4" />
    </video>
  );
}
