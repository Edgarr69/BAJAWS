'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const supabase = createClient();
  const router   = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Timeout de seguridad: si /api/me tarda más de 4s, mostrar el form igualmente
    const timeout = setTimeout(() => setChecking(false), 4000);
    fetch('/api/me')
      .then(r => {
        clearTimeout(timeout);
        if (r.ok) router.replace('/panel/dashboard'); else setChecking(false);
      })
      .catch(() => { clearTimeout(timeout); setChecking(false); });
    return () => clearTimeout(timeout);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setError('Correo o contraseña incorrectos.');
      setLoading(false);
    } else {
      router.replace('/panel/dashboard');
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / marca */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Baja Wastewater Solution</h1>
          <p className="text-primary-200 text-sm mt-1">Panel de administración interno</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl text-primary-900">Iniciar sesión</CardTitle>
            <CardDescription>Accede con tu correo y contraseña</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-6 px-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@bajaws.com.mx"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 placeholder:text-slate-300"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 placeholder:text-slate-300"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-primary-700 hover:bg-primary-600 text-white font-medium mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Entrando…
                  </span>
                ) : 'Entrar'}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Solo personal autorizado de Baja Wastewater Solution
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
