"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogIn, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { siteContent } from "@/content/site";

export default function Header() {
  const [isOpen, setIsOpen]       = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [dropOpen, setDropOpen]   = useState(false);
  const dropRef                   = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { links } = siteContent.nav;

  useEffect(() => {
    const setDvh = () =>
      document.documentElement.style.setProperty("--dvh", `${window.innerHeight}px`);
    setDvh();

    // Actualiza --dvh cuando scroll llega a 0: la barra del navegador siempre
    // está visible en ese momento, así que innerHeight es el valor correcto.
    // Ignora resizes de solo-altura (barra animándose) para evitar el estirón.
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      if (window.scrollY === 0) setDvh();
    };

    let prevWidth = window.innerWidth;
    const onResize = () => {
      const w = window.innerWidth;
      if (w !== prevWidth) { prevWidth = w; setDvh(); }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Al cambiar de ruta, resetear a no-scrolled para que el hero quede alineado
  useEffect(() => {
    setScrolled(false);
    setIsOpen(false);
  }, [pathname]);

  // --header-height: al encoger actualiza inmediato; al expandir espera 300ms
  // para sincronizar con la transición CSS del header (transition-all duration-300).
  useEffect(() => {
    if (scrolled) {
      document.documentElement.style.setProperty("--header-height", "3rem");
    } else {
      const t = setTimeout(
        () => document.documentElement.style.setProperty("--header-height", "4rem"),
        300
      );
      return () => clearTimeout(t);
    }
  }, [scrolled]);

  // Bloquea scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 transition-all duration-300 ${
          scrolled ? "shadow-md border-b border-white/10" : "shadow-sm"
        }`}
      >
        <div className="px-8 sm:px-12 lg:px-16">
          <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "h-12" : "h-16"}`}>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0" onClick={() => window.scrollTo({ top: 0 })}>
              <Image
                src="/logoo.webp"
                alt="Baja Wastewater Solution"
                width={160}
                height={62}
                sizes="160px"
                className={`w-auto object-contain transition-all duration-300 ${scrolled ? "h-7" : "h-9"}`}
                priority
              />
            </Link>

            {/* Links + CTA — desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const active = pathname === link.href || pathname.startsWith(link.href + '/');
                if (link.href === '/servicios') {
                  return (
                    <div
                      key={link.href}
                      ref={dropRef}
                      className="relative"
                      onMouseEnter={() => setDropOpen(true)}
                      onMouseLeave={() => setDropOpen(false)}
                    >
                      <button
                        className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 ${
                          active
                            ? "text-white font-semibold bg-white/15"
                            : "text-white/75 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {link.label}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {dropOpen && (
                        <div className="absolute top-full left-0 pt-1.5 z-50">
                          <div className="bg-primary-900/80 backdrop-blur-md rounded-xl shadow-xl border border-white/10 py-1.5 min-w-[200px] overflow-hidden">
                            <Link
                              href="/servicios"
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/75 hover:text-white hover:bg-white/10 transition-colors"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-white/50 flex-shrink-0" />
                              Todos los servicios
                            </Link>
                            <Link
                              href="/servicios/integrales"
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/75 hover:text-emerald-300 hover:bg-white/10 transition-colors"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                              Servicios integrales
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 ${
                      active
                        ? "text-white font-semibold bg-white/15"
                        : "text-white/75 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/#cotizacion"
                className="ml-4 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all duration-150 shadow-sm hover:shadow-md"
              >
                Solicitar cotización
              </Link>
            </nav>

            <Link
              href="/login"
              aria-label="Acceso interno"
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/25 hover:text-white/60 transition-colors duration-200"
            >
              <LogIn className="w-4 h-4" />
            </Link>

            {/* Hamburger — móvil */}
            <button
              className="md:hidden p-2 rounded-md text-white/75 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setIsOpen(true)}
              aria-label="Abrir menú"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Menú móvil — panel deslizante desde la derecha ─────────────────────── */}

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-72 bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 shadow-2xl md:hidden flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Cabecera del panel */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <Image
            src="/logoo.webp"
            alt="Baja Wastewater Solution"
            width={120}
            height={47}
            className="h-7 w-auto object-contain"
          />
          <div className="flex items-center gap-1">
            <Link
              href="/login"
              aria-label="Acceso interno"
              className="p-2 text-white/25 hover:text-white/60 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <LogIn className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar menú"
              className="p-2 text-white/75 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Links del panel */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/');
            if (link.href === '/servicios') {
              return (
                <div key={link.href}>
                  <Link
                    href="/servicios"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                      active
                        ? "text-white bg-white/15"
                        : "text-white/75 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />}
                  </Link>
                  <Link
                    href="/servicios/integrales"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 pl-8 text-sm text-emerald-300/80 hover:text-emerald-200 rounded-xl transition-colors"
                  >
                    <span className="w-1 h-1 rounded-full bg-emerald-400/60" />
                    Servicios integrales
                  </Link>
                </div>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  active
                    ? "text-white bg-white/15"
                    : "text-white/75 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
                {active && <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />}
              </Link>
            );
          })}
        </nav>

        {/* CTA fijo en el fondo del panel */}
        <div className="px-4 py-5 border-t border-white/10">
          <Link
            href="/#cotizacion"
            onClick={() => setIsOpen(false)}
            className="block w-full text-center px-4 py-3 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-full transition-colors"
          >
            Solicitar cotización
          </Link>
        </div>
      </div>
    </>
  );
}
