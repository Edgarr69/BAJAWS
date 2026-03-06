'use client';

import { useEffect, useRef, useState } from 'react';

export function useCountUp(
  target: number,
  duration = 900,
  decimals = 0,
  trigger = true,
): string {
  const [display, setDisplay] = useState('0');
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trigger) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    if (target === 0) {
      setDisplay((0).toFixed(decimals));
      return;
    }

    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setDisplay(current.toFixed(decimals));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, decimals, trigger]);

  return display;
}
