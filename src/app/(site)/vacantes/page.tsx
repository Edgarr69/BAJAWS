import type { Metadata } from 'next';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { getAdminClient } from '@/lib/supabase/admin';
import type { JobPosting } from '@/types/panel';
import { VacantesPublicClient } from './VacantesPublicClient';

export const revalidate = 300;
export const metadata: Metadata = {
  title: { absolute: 'Vacantes | Baja Wastewater Solution' },
  description: 'Únete al equipo de Baja Wastewater Solution. Consulta las vacantes disponibles y envía tu postulación.',
  alternates: { canonical: '/vacantes' },
};

export default async function VacantesPage() {
  const admin = getAdminClient();
  const { data } = await admin
    .from('job_postings')
    .select('id, titulo, descripcion, requisitos, ubicacion, modalidad, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const postings = (data ?? []) as JobPosting[];

  return (
    <div className="flex flex-col bg-white overflow-hidden h-[calc(var(--dvh,100svh)-var(--header-height,4rem))]">

      {/* Encabezado */}
      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 py-4 sm:py-5 shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll direction="fade">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-700 mb-2">
              Únete al equipo
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Trabaja con nosotros
            </h1>
            <div className="mt-3 w-10 h-1 bg-primary-600 rounded-full" />
          </AnimateOnScroll>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="flex-1 overflow-hidden py-4 sm:py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <VacantesPublicClient postings={postings} />
        </div>
      </div>

    </div>
  );
}
