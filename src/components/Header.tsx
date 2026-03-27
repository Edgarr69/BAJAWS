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
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Al cambiar de ruta, sincroniza el estado con el scroll real (evita hueco en el hero)
  useEffect(() => {
    setScrolled(window.scrollY > 20);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 transition-all duration-300 relative ${
        scrolled ? "shadow-md border-b border-white/10" : "shadow-sm"
      }`}
    >
      <div className="px-8 sm:px-12 lg:px-16">
        <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "h-12" : "h-16"}`}>

          {/* Logo — alineado con el inicio del texto del hero */}
          <Link href="/" className="flex-shrink-0">
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

          {/* Links + CTA — derecha */}
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

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-white/75 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-white/10 py-2 pb-3 relative">
            <Link
              href="/login"
              aria-label="Acceso interno"
              className="absolute top-2 right-1 p-2 text-white/25 hover:text-white/60 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              <LogIn className="w-3.5 h-3.5" />
            </Link>
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/');
              if (link.href === '/servicios') {
                return (
                  <div key={link.href}>
                    <Link
                      href="/servicios"
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-2.5 text-sm font-medium rounded-md mx-1 transition-colors ${
                        active
                          ? "text-white font-semibold bg-white/15"
                          : "text-white/75 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {link.label}
                    </Link>
                    <Link
                      href="/servicios/integrales"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-sm text-emerald-300/80 hover:text-emerald-200 rounded-md mx-1 pl-8 transition-colors"
                    >
                      → Servicios integrales
                    </Link>
                  </div>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2.5 text-sm font-medium rounded-md mx-1 transition-colors ${
                    active
                      ? "text-white font-semibold bg-white/15"
                      : "text-white/75 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mx-1 mt-2 pt-2 border-t border-white/10">
              <Link
                href="/#cotizacion"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-full transition-colors text-center"
              >
                Solicitar cotización
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
