'use client';

import { useEffect, useRef, useState } from 'react';
import { NumberTicker } from '@/components/ui/number-ticker';

interface HeroStatsProps {
  yearsExperience: number;
  authorizationsCount: number;
}

export default function HeroStats({ yearsExperience, authorizationsCount }: HeroStatsProps) {
  const stats = [
    { value: yearsExperience,      suffix: '+', label: 'Años de experiencia'    },
    { value: authorizationsCount,  suffix: '',  label: 'Autorizaciones vigentes' },
    { value: 100,                  suffix: '%', label: 'Cumplimiento ambiental'  },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          setActiveCount(1);
          t1 = setTimeout(() => setActiveCount(2), 2000);
          t2 = setTimeout(() => setActiveCount(3), 4000);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative z-10 text-white">
      <div className="grid grid-cols-3">
        {stats.map((s, i) => (
          <div key={s.label} className="py-4 sm:py-5 px-2 sm:px-6 lg:px-10 text-center">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-sm">
              {i < activeCount ? (
                <>
                  <NumberTicker value={s.value} className="text-white" />
                  {s.suffix}
                </>
              ) : (
                <span className="invisible">0{s.suffix}</span>
              )}
            </p>
            <p className="text-white/60 text-[10px] sm:text-xs mt-1 tracking-wide uppercase leading-tight">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
