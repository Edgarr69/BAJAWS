import { getAdminClient } from '@/lib/supabase/admin';
import { GaleriaClient } from './GaleriaClient';
import type { GaleriaFoto } from '@/types/panel';

export default async function GaleriaPage() {
  const admin = getAdminClient();
  const { data } = await admin
    .from('galeria_fotos')
    .select('*')
    .order('orden');

  const fotos: GaleriaFoto[] = data ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Galeria — Nuestra Flota</h1>
        <p className="text-sm text-gray-500 mt-1">
          Arrastra las fotos para reordenar. Usa Vista previa para ver como quedara en el sitio antes de guardar.
        </p>
      </div>
      <GaleriaClient fotos={fotos} />
    </div>
  );
}
