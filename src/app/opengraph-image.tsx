import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Baja Wastewater Solution — Tratamiento de Aguas Residuales Industriales';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bajaws.com.mx';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0B3C5D',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        {/* Logo — next/og renderiza en un canvas propio, no soporta next/image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${SITE_URL}/logoo.webp`}
          alt=""
          width={340}
          height={132}
          style={{ objectFit: 'contain' }}
        />

        {/* Separador */}
        <div style={{
          width: '80px',
          height: '4px',
          background: '#2980B9',
          borderRadius: '2px',
          marginTop: '40px',
          marginBottom: '32px',
        }} />

        {/* Tagline */}
        <div style={{
          color: 'white',
          fontSize: '36px',
          fontWeight: 700,
          textAlign: 'center',
          fontFamily: 'sans-serif',
          lineHeight: 1.3,
          maxWidth: '900px',
        }}>
          Tratamiento de Aguas Residuales Industriales
        </div>

        <div style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '22px',
          marginTop: '20px',
          textAlign: 'center',
          fontFamily: 'sans-serif',
        }}>
          Baja California · SEMARNAT · CESPT · SEMAR · SCT
        </div>
      </div>
    ),
    { ...size }
  );
}
