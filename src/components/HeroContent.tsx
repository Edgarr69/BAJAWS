'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import HeroTypewriter from './HeroTypewriter';
import HeroStats from './HeroStats';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Props {
  yearsExperience:     number;
  authorizationsCount: number;
}

function fadeStyle(visible: boolean, delayMs: number, reduced: boolean): React.CSSProperties {
  if (reduced) return {};
  return {
    opacity:    visible ? 1 : 0,
    transform:  visible ? 'translateY(0)' : 'translateY(10px)',
    transition: 'opacity 1000ms ease-out, transform 1000ms ease-out',
    transitionDelay: visible ? `${delayMs}ms` : '0ms',
  };
}

export default function HeroContent({ yearsExperience, authorizationsCount }: Props) {
  const [eyebrowVisible,  setEyebrowVisible]  = useState(false);
  const [contentVisible,  setContentVisible]  = useState(false);
  const [statsReady,      setStatsReady]      = useState(false);
  const reducedMotion = useReducedMotion();

  // Eyebrow aparece primero, al montar
  useEffect(() => {
    const t = setTimeout(() => setEyebrowVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Contenido */}
      <div className="relative z-10 flex flex-1 items-center px-4 sm:px-8 md:px-12 lg:px-20 pt-5 pb-20 sm:pt-10 sm:pb-24 min-h-0">
        <div className="max-w-2xl">

          {/* Eyebrow + línea — aparecen primero */}
          <div
            className="flex items-center gap-3 mb-5"
            style={fadeStyle(eyebrowVisible, 0, reducedMotion)}
          >
            <span className="text-teal-300 text-xs font-bold tracking-[0.25em] uppercase" translate="no">
              Baja Wastewater Solutions
            </span>
            <span className="h-px w-12 bg-teal-400/60" />
          </div>

          {/* Titular — typewriter empieza después del eyebrow */}
          <HeroTypewriter
            onNearComplete={() => setContentVisible(true)}
            onComplete={() => setStatsReady(true)}
          />

          {/* Divisor */}
          <div
            className="w-14 h-[3px] bg-teal-400 rounded-full mb-6"
            style={fadeStyle(contentVisible, 0, reducedMotion)}
          />

          {/* Subtítulo */}
          <p
            className="text-white/75 text-base sm:text-lg leading-relaxed mb-8 max-w-lg"
            style={fadeStyle(contentVisible, 200, reducedMotion)}
          >
            Diseñamos, implementamos y operamos sistemas de tratamiento con
            enfoque ambiental, eficiencia operativa y cumplimiento normativo.
          </p>

          {/* Autorizaciones */}
          <div
            className="flex items-center gap-x-4 flex-wrap gap-y-2 mb-9"
            style={fadeStyle(contentVisible, 450, reducedMotion)}
          >
            {['SEMARNAT', 'CESPT', 'SEMAR', 'SCT'].map((org, i) => (
              <div key={org} className="flex items-center gap-x-3">
                {i > 0 && <span className="hidden sm:block w-px h-3.5 bg-white/20 flex-shrink-0" />}
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-[11px] font-semibold text-white/75 tracking-wider">{org}</span>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div
            className="flex flex-wrap gap-3"
            style={fadeStyle(contentVisible, 700, reducedMotion)}
          >
            <Link
              href="#cotizacion"
              className="inline-block bg-teal-600 hover:bg-teal-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-lg"
            >
              Solicitar cotización
            </Link>
            <Link
              href="/servicios"
              className="inline-block bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl border border-white/25 transition-all duration-200 active:scale-[0.98]"
            >
              Ver servicios →
            </Link>
          </div>
        </div>
      </div>

      {/* Stats — se activan cuando el typewriter termina */}
      <HeroStats
        yearsExperience={yearsExperience}
        authorizationsCount={authorizationsCount}
        ready={statsReady}
      />
    </>
  );
}
