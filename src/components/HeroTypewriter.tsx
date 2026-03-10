'use client';

import { useEffect, useRef, useState } from 'react';

const LINE1 = 'Soluciones integrales en';
const LINE2 = 'manejo de residuos peligrosos';
const TOTAL  = LINE1.length + LINE2.length;

// Dispara onNearComplete justo cuando empieza "peligrosos"
const NEAR_THRESHOLD = 14;

interface Props {
  onComplete?:     () => void;
  onNearComplete?: () => void;
}

export default function HeroTypewriter({ onComplete, onNearComplete }: Props) {
  const [charIndex,     setCharIndex]     = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [started,       setStarted]       = useState(false);

  const onCompleteRef     = useRef(onComplete);
  const onNearCompleteRef = useRef(onNearComplete);
  const nearFiredRef      = useRef(false);
  onCompleteRef.current     = onComplete;
  onNearCompleteRef.current = onNearComplete;

  // Espera a que el eyebrow termine de aparecer antes de empezar
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!started) return;

    if (charIndex >= TOTAL) {
      const t = setTimeout(() => {
        setCursorVisible(false);
        onCompleteRef.current?.();
      }, 700);
      return () => clearTimeout(t);
    }

    if (!nearFiredRef.current && charIndex >= TOTAL - NEAR_THRESHOLD) {
      nearFiredRef.current = true;
      onNearCompleteRef.current?.();
    }

    const ch    = (LINE1 + LINE2)[charIndex];
    const delay = ch === ' '
      ? 100 + Math.random() * 80  // 100–180 ms en espacios
      : 55  + Math.random() * 65; // 55–120 ms en letras

    const t = setTimeout(() => setCharIndex(i => i + 1), delay);
    return () => clearTimeout(t);
  }, [started, charIndex]);

  // Porción visible de cada línea
  const line1Visible = LINE1.slice(0, Math.min(charIndex, LINE1.length));
  const line1Hidden  = LINE1.slice(Math.min(charIndex, LINE1.length));
  const line2Offset  = Math.max(0, charIndex - LINE1.length);
  const line2Visible = LINE2.slice(0, line2Offset);
  const line2Hidden  = LINE2.slice(line2Offset);

  const cursorOnLine1 = started && charIndex < LINE1.length;
  const cursorOnLine2 = started && charIndex >= LINE1.length && cursorVisible;

  const cursorStyle: React.CSSProperties = {
    animation:  cursorVisible ? 'cursor-blink 0.9s steps(1) infinite' : 'none',
    opacity:    cursorVisible ? 1 : 0,
    transition: 'opacity 0.5s ease',
  };

  const Cursor = ({ teal }: { teal?: boolean }) => (
    <span
      className={`inline-block w-[7px] h-[1.2em] align-middle ml-[3px] rounded-[1px] ${teal ? 'bg-teal-300' : 'bg-white'}`}
      style={cursorStyle}
    />
  );

  return (
    // aria-label para lectores de pantalla — ven el texto completo
    <h1
      aria-label={`${LINE1} ${LINE2}`}
      className="font-extrabold leading-[1.1] tracking-tight mb-5 text-white text-[2rem] sm:text-[2.8rem] lg:text-[3rem] xl:text-[3.4rem]"
    >
      {/* Línea 1: chars escritos → cursor → chars invisibles que reservan espacio */}
      {line1Visible}
      {cursorOnLine1 && <Cursor />}
      <span aria-hidden="true" style={{ visibility: 'hidden', userSelect: 'none' }}>{line1Hidden}</span>

      {/* Línea 2: siempre en el DOM para que el h1 no cambie de alto */}
      <span className="block text-teal-300 mt-1" aria-hidden="true">
        {line2Visible}
        {cursorOnLine2 && <Cursor teal />}
        <span style={{ visibility: 'hidden', userSelect: 'none' }}>{line2Hidden}</span>
      </span>
    </h1>
  );
}
