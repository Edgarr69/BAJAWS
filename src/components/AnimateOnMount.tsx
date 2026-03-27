"use client";

import { useEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "fade" | "left" | "right";
}

/**
 * Anima el contenido al montar la página (no al hacer scroll).
 * Ideal para elementos ya visibles en el viewport inicial.
 */
export default function AnimateOnMount({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const hiddenMap: Record<string, string> = {
    up:    "opacity-0 translate-y-4",
    fade:  "opacity-0",
    left:  "opacity-0 -translate-x-6",
    right: "opacity-0 translate-x-6",
  };

  const hidden = hiddenMap[direction] ?? "opacity-0";

  return (
    <div
      className={`transition-[transform,opacity] duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0 translate-x-0" : hidden
      } ${className}`}
    >
      {children}
    </div>
  );
}
