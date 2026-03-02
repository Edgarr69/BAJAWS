'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AccesoSolicitadoPage() {
  const supabase = createClient();
  const [email, setEmail]       = useState('');
  const [checking, setChecking] = useState(false);
  const [mensaje, setMensaje]   = useState('');

  useEffect(() => {
    // Obtener el email del usuario autenticado para mostrarlo
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  async function handleReintentar() {
    setChecking(true);
    setMensaje('');
    try {
      const res = await fetch('/api/me', { credentials: 'include' });
      if (!res.ok) {
        // Ya no tiene sesión → mandar al login
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      if (data.role !== 'pending') {
        // Fue aprobado → al panel
        window.location.href = '/panel/dashboard';
      } else {
        setMensaje('Tu solicitud aún está pendiente de aprobación.');
      }
    } catch {
      setMensaje('No se pudo verificar el estado. Intenta de nuevo.');
    } finally {
      setChecking(false);
    }
  }

  async function handleCerrarSesion() {
    await supabase.auth.signOut();
    await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' });
    window.location.href = '/login';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Icono */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Solicitud enviada</h1>
          <p className="text-primary-200 text-sm mt-1">Baja Wastewater Solution — Panel interno</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-5">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-2">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Acceso pendiente de aprobación</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Tu cuenta{email ? <> <strong className="text-slate-700">{email}</strong></> : ''} ha
              solicitado acceso al panel. Un administrador revisará tu solicitud a la brevedad.
            </p>
          </div>

          {/* Mensaje de reintento */}
          {mensaje && (
            <p className="text-sm text-center text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
              {mensaje}
            </p>
          )}

          {/* Botones */}
          <div className="space-y-3 pt-1">
            <button
              onClick={handleReintentar}
              disabled={checking}
              className="w-full h-11 bg-primary-700 hover:bg-primary-600 disabled:opacity-60 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {checking ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Verificando…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Ya me aprobaron — Volver a intentar
                </>
              )}
            </button>

            <button
              onClick={handleCerrarSesion}
              className="w-full h-10 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
