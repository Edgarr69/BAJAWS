'use client';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-gray-500 text-sm">Error al cargar la galeria.</p>
      <button
        onClick={reset}
        className="text-xs text-primary-600 hover:underline"
      >
        Reintentar
      </button>
    </div>
  );
}
