'use client';

import { useEffect, useState } from 'react';
import { NumberTicker } from '@/components/ui/number-ticker';

interface HeroStatsProps {
  yearsExperience:     number;
  authorizationsCount: number;
  ready:               boolean;
}

export default function HeroStats({ yearsExperience, authorizationsCount, ready }: HeroStatsProps) {
  const stats = [
    { value: yearsExperience,      suffix: '+', label: 'Años de experiencia'    },
    { value: authorizationsCount,  suffix: '',  label: 'Autorizaciones vigentes' },
    { value: 100,                  suffix: '%', label: 'Cumplimiento ambiental'  },
  ];

  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    if (!ready) return;
    setActiveCount(1);
  }, [ready]);

  return (
    <div className="relative z-10 text-white">
      <div className="grid grid-cols-3">
        {stats.map((s, i) => (
          <div key={s.label} className="py-4 sm:py-5 px-2 sm:px-6 lg:px-10 text-center">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-sm">
              {i < activeCount ? (
                <>
                  <NumberTicker
                    value={s.value}
                    className="text-white"
                    onComplete={i + 1 < stats.length ? () => setActiveCount(i + 2) : undefined}
                  />
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
