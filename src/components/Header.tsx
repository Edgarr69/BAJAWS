"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { siteContent } from "@/content/site";

export default function Header() {
  const [isOpen, setIsOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { links } = siteContent.nav;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 transition-all duration-300 ${
        scrolled ? "shadow-md border-b border-white/10" : "shadow-sm"
      }`}
    >
      <div className="px-8 sm:px-12 lg:px-16">
        <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "h-12" : "h-16"}`}>

          {/* Logo — alineado con el inicio del texto del hero */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logoo.png"
              alt="Baja Wastewater Solution"
              width={160}
              height={62}
              className={`w-auto object-contain transition-all duration-300 ${scrolled ? "h-7" : "h-9"}`}
              priority
            />
          </Link>

          {/* Links + CTA — derecha */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
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
          <div className="md:hidden border-t border-white/10 py-2 pb-3">
            {links.map((link) => {
              const active = pathname === link.href;
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
