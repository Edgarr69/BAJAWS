"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  videoId: string;
  title: string;
}

// Facade de YouTube: carga el thumbnail localmente y solo inicia el player al hacer click.
// Ahorra ~768 KB de JS/CSS de YouTube en el initial load.
export default function YoutubeEmbed({ videoId, title }: Props) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        className="w-full h-full"
      />
    );
  }

  return (
    <button
      onClick={() => setActive(true)}
      className="relative w-full h-full group focus:outline-none"
      aria-label={`Reproducir: ${title}`}
    >
      {/* Thumbnail */}
      <Image
        src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 768px"
        className="object-cover"
        onError={(e) => {
          // Fallback a hqdefault si maxresdefault no existe
          (e.target as HTMLImageElement).src =
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        }}
      />
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-200" />
      {/* Botón play */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-red-600 group-hover:bg-red-500 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 group-hover:scale-110">
          <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </button>
  );
}
