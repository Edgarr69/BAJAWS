'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ContactosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[panel:contactos] error boundary:', error);
  }, [error]);

  return (
    <div className="max-w-md">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-10">
        <h1 className="text-2xl font-semibold text-primary-900 mb-3">
          Error al cargar mensajes
        </h1>
        <p className="text-slate-600 mb-8">
          Ocurrió un error inesperado al cargar esta sección. Puedes reintentar
          o volver al dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => reset()} className="w-full sm:w-auto">
            Reintentar
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/panel/dashboard">Volver al dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
