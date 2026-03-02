"use client";
import { useRef, useEffect } from "react";

const FADE = 0.9; // segundos de transición en cada extremo del loop

export default function VideoBackground({ src }: { src: string }) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video   = videoRef.current;
    const overlay = overlayRef.current;
    if (!video || !overlay) return;

    const tick = () => {
      if (!video.duration) return;
      const nearEnd = video.duration - video.currentTime < FADE;
      overlay.style.opacity = nearEnd ? "1" : "0";
    };

    video.addEventListener("timeupdate", tick);
    return () => video.removeEventListener("timeupdate", tick);
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center"
      >
        <source src={src} type="video/mp4" />
      </video>
      {/* Overlay que se opaca al final del loop y se aclara al reiniciar */}
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          backgroundColor: "rgba(7,30,48,0.92)",
          opacity: 0,
          transition: `opacity ${FADE}s ease`,
        }}
      />
    </>
  );
}
