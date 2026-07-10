'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Briefcase, Send, X, FileText, Eye, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { JobPosting } from '@/types/panel';

interface Props {
  postings: JobPosting[];
}

const MODALIDAD: Record<string, { label: string; cls: string }> = {
  presencial: { label: 'Presencial', cls: 'bg-primary-50 text-primary-700 border-primary-200' },
  remoto:     { label: 'Remoto',     cls: 'bg-accent-50  text-accent-700  border-accent-200'  },
  hibrido:    { label: 'Híbrido',    cls: 'bg-amber-50   text-amber-700   border-amber-200'   },
};

function parseRequirements(text: string): string[] {
  return text.split(/\r?\n/).map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
}

export function VacantesPublicClient({ postings }: Props) {
  const [selected, setSelected]   = useState<JobPosting | null>(null);
  const [success, setSuccess]     = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const [sending, setSending]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const [nombre, setNombre]       = useState('');
  const [correo, setCorreo]       = useState('');
  const [telefono, setTelefono]   = useState('');
  const [mensaje, setMensaje]     = useState('');
  const [cvFile, setCvFile]       = useState<File | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const fileRef     = useRef<HTMLInputElement>(null);
  const scrollRef   = useRef(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bajaws_applied');
      if (stored) setAppliedIds(new Set(JSON.parse(stored) as string[]));
    } catch { /* localStorage bloqueado o datos corruptos — ignorar */ }
  }, []);

  function handleOpenPreview() {
    if (!cvFile) return;
    setPreviewUrl(URL.createObjectURL(cvFile));
  }

  function handleClosePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }

  const nombreValid = nombre.trim().length >= 2;
  const correoValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());

  function resetForm() {
    setNombre(''); setCorreo(''); setTelefono(''); setMensaje('');
    setCvFile(null); setAttempted(false); setError(null); setSuccess(false); setDuplicate(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  function markApplied(postingId: string) {
    setAppliedIds(prev => {
      const next = new Set(prev).add(postingId);
      try { localStorage.setItem('bajaws_applied', JSON.stringify([...next])); } catch { /* ignorar */ }
      return next;
    });
  }

  function handleOpenModal(posting: JobPosting) {
    scrollRef.current = window.scrollY;
    resetForm();
    setSelected(posting);
  }

  function handleClose() {
    if (sending) return;
    setSelected(null);
    resetForm();
    // Restaurar posición de scroll — iOS mueve el body al abrir el teclado en el modal
    requestAnimationFrame(() => window.scrollTo(0, scrollRef.current));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);
    if (!nombreValid || !correoValid) return;

    if (cvFile) {
      if (cvFile.type !== 'application/pdf') { setError('Solo se aceptan archivos PDF para el CV.'); return; }
      if (cvFile.size > 5 * 1024 * 1024)    { setError('El CV no puede superar 5 MB.'); return; }
    }

    setSending(true);
    setError(null);

    const fd = new FormData();
    fd.append('posting_id', selected!.id);
    fd.append('nombre',     nombre.trim());
    fd.append('correo',     correo.trim());
    fd.append('hp', '');
    if (telefono.trim()) fd.append('telefono', telefono.trim());
    if (mensaje.trim())  fd.append('mensaje',  mensaje.trim());
    if (cvFile)          fd.append('cv', cvFile);

    try {
      const res  = await fetch('/api/public/apply', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          // Ya aplicó con este correo — marcar localmente y mostrar la alerta de duplicado
          // (NO es éxito: no se registró nada ni se envió correo)
          markApplied(selected!.id);
          setDuplicate(true);
          return;
        }
        setError(
          res.status === 429 ? 'Demasiados envíos. Intenta más tarde.'  :
          res.status === 404 ? 'Esta vacante ya no está disponible.'    :
          data?.message ?? 'Ocurrió un error. Intenta nuevamente.'
        );
        return;
      }
      markApplied(selected!.id);
      setSuccess(true);
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setSending(false);
    }
  }

  /* ─── Estado sin vacantes ────────────────────────────────────────────────── */
  if (postings.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-8">
        <div className="w-14 h-14 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-slate-700 font-semibold text-sm">
          No hay vacantes disponibles en este momento
        </p>
        <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
          No tenemos convocatorias abiertas. Visita esta página más adelante
          o contáctanos directamente.
        </p>
        <a href="/contacto" className="mt-1 text-sm text-primary-700 font-medium hover:underline">
          Ir a contacto
        </a>
      </div>
    );
  }

  /* ─── Lista de vacantes ──────────────────────────────────────────────────── */
  return (
    <>
      <div className="space-y-6">

        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          {postings.length === 1 ? '1 vacante abierta' : `${postings.length} vacantes abiertas`}
        </p>

        <div className="space-y-4">
          {postings.map(posting => {
            const modalidad = MODALIDAD[posting.modalidad] ?? MODALIDAD.presencial;
            const reqs = posting.requisitos ? parseRequirements(posting.requisitos) : [];
            const applied = appliedIds.has(posting.id);

            return (
              <div
                key={posting.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200 overflow-hidden"
              >
                {/* ── Cabecera ── */}
                <div className="px-5 pt-5 pb-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Badge modalidad */}
                    <span className={`inline-block text-[11px] font-semibold border rounded-md px-2 py-0.5 mb-2 ${modalidad.cls}`}>
                      {modalidad.label}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 leading-snug">
                      {posting.titulo}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {posting.ubicacion}
                    </div>
                  </div>

                  {/* Acción */}
                  <div className="shrink-0 mt-0.5">
                    {applied ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-700 bg-accent-50 border border-accent-200 rounded-lg px-3 py-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Ya postulaste
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-primary-700 hover:bg-primary-600 gap-1.5"
                        onClick={() => handleOpenModal(posting)}
                      >
                        <Send className="w-3.5 h-3.5" />
                        Aplicar
                      </Button>
                    )}
                  </div>
                </div>

                {/* ── Separador ── */}
                <div className="border-t border-slate-50 mx-5" />

                {/* ── Cuerpo ── */}
                <div className="px-5 pt-4 pb-5 space-y-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {posting.descripcion}
                  </p>

                  {reqs.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
                        Requisitos
                      </p>
                      <ul className="space-y-2">
                        {reqs.map((req, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-[5px] shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {posting.prestaciones && parseRequirements(posting.prestaciones).length > 0 && (
                    <div className="bg-accent-50 rounded-xl p-4 border border-accent-100">
                      <p className="text-[11px] font-semibold text-accent-600 uppercase tracking-widest mb-3">
                        Prestaciones
                      </p>
                      <ul className="space-y-2">
                        {parseRequirements(posting.prestaciones).map((p, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-[5px] shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ─── Modal vista previa PDF ──────────────────────────────────────────
           Usar Dialog de Radix (no portal manual) para que el sistema de
           capas de Radix asigne pointer-events correctamente al embed.
           Un portal manual queda "fuera" del árbol de Radix y recibe
           pointer-events:none → el PDF no puede recibir scroll.
      ─────────────────────────────────────────────────────────────────────── */}
      <Dialog
        open={!!previewUrl}
        onOpenChange={open => { if (!open) handleClosePreview(); }}
      >
        <DialogContent
          className="max-w-4xl p-0 overflow-hidden gap-0"
          overlayClassName="bg-black/10 backdrop-blur-[2px]"
          style={{ height: '85vh', display: 'grid', gridTemplateRows: 'auto 1fr' }}
          onEscapeKeyDown={(e) => { e.stopPropagation(); handleClosePreview(); }}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="px-4 py-3 border-b border-slate-100 flex-row items-center justify-between space-y-0">
            <DialogTitle className="flex items-center gap-2 text-sm font-medium text-slate-700 min-w-0 pr-8">
              <FileText className="w-4 h-4 text-primary-600 shrink-0" />
              <span className="truncate">{cvFile?.name}</span>
            </DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <embed
              src={previewUrl}
              type="application/pdf"
              className="w-full h-full block"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Modal de postulación ─────────────────────────────────────────────── */}
      <Dialog open={!!selected} onOpenChange={open => { if (!open && !previewUrl) handleClose(); }}>
        <DialogContent
          className="sm:max-w-lg max-h-[90svh] overflow-y-auto"
          onInteractOutside={(e) => { if (previewUrl) e.preventDefault(); }}
          onEscapeKeyDown={(e) => { if (previewUrl) e.preventDefault(); }}
        >
          <DialogHeader>
            <DialogTitle>
              {success ? 'Postulación enviada' : duplicate ? 'Correo ya registrado' : `Aplicar — ${selected?.titulo}`}
            </DialogTitle>
          </DialogHeader>

          {duplicate ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v3.75m0 3.75h.008M10.34 3.94l-7.5 13a1.5 1.5 0 001.3 2.25h15a1.5 1.5 0 001.3-2.25l-7.5-13a1.5 1.5 0 00-2.6 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-amber-800 mb-2">Este correo ya está registrado</h3>
              <p className="text-amber-700 text-sm leading-relaxed">
                Ya recibimos una postulación con este correo para esta vacante. No necesitas
                volver a enviarla.
              </p>
              <p className="text-amber-700 text-sm leading-relaxed mt-3 font-semibold">
                Volver a postular usando otro correo puede causar que tu postulación no sea
                considerada por duplicidad.
              </p>
              <button
                onClick={handleClose}
                className="mt-5 text-primary-600 hover:text-primary-800 underline text-sm transition-colors"
              >
                Entendido, cerrar
              </button>
            </div>
          ) : success ? (
            <div className="bg-accent-50 border border-accent-200 rounded-xl p-8 text-center">
              <div className="w-14 h-14 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-accent-800 mb-2">Postulación enviada</h3>
              <p className="text-accent-700 text-sm">
                Nos pondremos en contacto contigo si tu perfil es de interés.
              </p>
              <button
                onClick={handleClose}
                className="mt-5 text-primary-600 hover:text-primary-800 underline text-sm transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="py-3 space-y-4" noValidate>
              <input type="text" name="hp" className="hidden" tabIndex={-1} autoComplete="off" />

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  maxLength={80}
                  className={`w-full text-base md:text-sm border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 text-slate-700 placeholder:text-slate-300 ${
                    attempted && !nombreValid
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-slate-200 focus:ring-primary-500'
                  }`}
                />
                {attempted && !nombreValid && (
                  <p className="text-xs text-red-500 pl-1">El nombre es requerido</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Correo electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  value={correo}
                  onChange={e => setCorreo(e.target.value)}
                  maxLength={120}
                  className={`w-full text-base md:text-sm border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 text-slate-700 placeholder:text-slate-300 ${
                    attempted && !correoValid
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-slate-200 focus:ring-primary-500'
                  }`}
                />
                {attempted && !correoValid && (
                  <p className="text-xs text-red-500 pl-1">Ingresa un correo válido</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Teléfono <span className="text-slate-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+52 664 000 0000"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    maxLength={20}
                    className="w-full text-base md:text-sm border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 placeholder:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    CV en PDF <span className="text-slate-400 font-normal">(opcional, máx. 5 MB)</span>
                  </label>
                  {/* Input nativo oculto — se activa desde el botón custom */}
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="sr-only"
                    tabIndex={-1}
                    onChange={e => { setCvFile(e.target.files?.[0] ?? null); setError(null); }}
                  />
                  {!cvFile ? (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 rounded-lg px-3 py-3 text-sm text-slate-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      Adjuntar CV en PDF
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 border border-accent-200 bg-accent-50 rounded-lg px-3 py-2.5">
                      <FileText className="w-4 h-4 text-accent-600 shrink-0" />
                      <span className="flex-1 text-sm text-accent-700 font-medium truncate">
                        {cvFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={handleOpenPreview}
                        title="Vista previa del PDF"
                        className="text-accent-500 hover:text-primary-600 transition-colors shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCvFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                        title="Quitar archivo"
                        className="text-accent-500 hover:text-red-500 transition-colors shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Mensaje <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  placeholder="Cuéntanos sobre ti y por qué te interesa esta posición..."
                  value={mensaje}
                  onChange={e => setMensaje(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  className="w-full text-base md:text-sm border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 placeholder:text-slate-300 resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <Button type="button" variant="outline" onClick={handleClose} disabled={sending}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={sending}
                  className="bg-primary-700 hover:bg-primary-600 gap-2"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Enviando…' : 'Enviar postulación'}
                </Button>
              </div>

              <p className="text-xs text-slate-400 text-center pt-1">
                Al enviar, aceptas nuestro{' '}
                <Link href="/aviso-privacidad" className="text-primary-600 hover:underline">
                  Aviso de Privacidad
                </Link>
                .
              </p>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
