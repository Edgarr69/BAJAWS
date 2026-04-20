"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogIn, ChevronDown, LayoutGrid, Layers, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { siteContent } from "@/content/site";

const DROP_ITEMS = [
  { href: "/servicios",             Icon: LayoutGrid,  label: "Todos los servicios",    desc: "Visión general de soluciones"           },
  { href: "/servicios/integrales",  Icon: Layers,      label: "Cadena de valor",         desc: "7 etapas de gestión integral"           },
  { href: "/servicios/disposicion", Icon: ShieldCheck, label: "Proceso de disposición",  desc: "Recepción, tratamiento y confinamiento" },
];

export default function Header() {
  const [isOpen, setIsOpen]       = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [dropOpen, setDropOpen]   = useState(false);
  const dropRef                   = useRef<HTMLDivElement>(null);
  const dropTriggerRef            = useRef<HTMLButtonElement>(null);
  const dropItemRefs              = useRef<(HTMLAnchorElement | null)[]>([]);
  const mobileMenuRef             = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { links } = siteContent.nav;

  useEffect(() => {
    const setDvh = () =>
      document.documentElement.style.setProperty("--dvh", `${window.innerHeight}px`);
    setDvh();

    let lastScrollTime = 0;
    const onScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY === 0) { setScrolled(false); setDvh(); return; }
      const now = Date.now();
      if (now - lastScrollTime < 100) return;
      lastScrollTime = now;
      setScrolled(scrollY > 20);
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

  useEffect(() => {
    setScrolled(false);
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.setProperty("--header-height", "4rem");
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Focus trap for mobile menu
  useEffect(() => {
    if (!isOpen) return;
    const panel = mobileMenuRef.current;
    if (!panel) return;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    first?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setIsOpen(false); return; }
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleDropTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Escape") { setDropOpen(false); dropTriggerRef.current?.focus(); return; }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!dropOpen) { setDropOpen(true); setTimeout(() => dropItemRefs.current[0]?.focus(), 50); }
      else setDropOpen(false);
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setDropOpen(true); setTimeout(() => dropItemRefs.current[0]?.focus(), 50); }
  };

  const handleDropItemKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>, idx: number) => {
    if (e.key === "Escape") { setDropOpen(false); dropTriggerRef.current?.focus(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); dropItemRefs.current[idx + 1]?.focus(); }
    if (e.key === "ArrowUp")   { e.preventDefault(); idx === 0 ? dropTriggerRef.current?.focus() : dropItemRefs.current[idx - 1]?.focus(); }
    if (e.key === "Tab" && !e.shiftKey && idx === DROP_ITEMS.length - 1) setDropOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 transition-shadow duration-300 ${
          scrolled ? "shadow-md" : "shadow-sm"
        }`}
      >
        <div className="px-8 sm:px-12 lg:px-16">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link
              href="/"
              aria-label="Baja Wastewater Solution - Inicio"
              className="flex-shrink-0"
              onClick={() => { setIsOpen(false); window.scrollTo({ top: 0 }); }}
            >
              <Image
                src="/logoo.webp"
                alt="Baja Wastewater Solution"
                width={160}
                height={62}
                sizes="160px"
                className="w-auto object-contain h-9"
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
                      className="relative group/drop"
                    >
                      <button
                        ref={dropTriggerRef}
                        aria-haspopup="true"
                        aria-expanded={dropOpen}
                        onFocus={() => setDropOpen(true)}
                        onKeyDown={handleDropTriggerKeyDown}
                        className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 ${
                          active
                            ? "text-white font-semibold bg-white/15"
                            : "text-white/75 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {link.label}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 group-hover/drop:rotate-180 ${dropOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <div
                        role="menu"
                        className={`absolute top-full left-1/2 -translate-x-1/2 z-50 transition-[opacity,transform] duration-200 ease-out origin-top
                          opacity-0 -translate-y-2 scale-95 pointer-events-none
                          group-hover/drop:opacity-100 group-hover/drop:translate-y-0 group-hover/drop:scale-100 group-hover/drop:pointer-events-auto
                          ${dropOpen ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : ""}`}
                      >
                        <div className="mt-4 bg-[#060f1c] rounded-2xl border border-white/[0.12] w-[22rem] shadow-[0_32px_80px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.05)]">
                          <div className="p-2.5 flex flex-col gap-1.5">
                            {DROP_ITEMS.map(({ href, Icon, label, desc }, idx) => (
                              <Link
                                key={href}
                                href={href}
                                role="menuitem"
                                ref={(el) => { dropItemRefs.current[idx] = el; }}
                                onClick={() => setDropOpen(false)}
                                onKeyDown={(e) => handleDropItemKeyDown(e, idx)}
                                className="flex items-center gap-4 px-3.5 py-4 rounded-xl hover:bg-white/[0.07] active:scale-[0.98] transition-[background-color,transform] duration-200 ease-out group"
                              >
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/35 group-hover:scale-110 transition-all duration-200">
                                  <Icon className="w-4 h-4 text-emerald-300" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-white leading-none mb-2">{label}</p>
                                  <p className="text-xs text-white/55 group-hover:text-white/80 transition-colors leading-snug">{desc}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
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
              aria-expanded={isOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={mobileMenuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className={`fixed top-0 right-0 z-[70] h-full w-[min(18rem,75vw)] bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 shadow-2xl md:hidden flex flex-col transition-transform duration-300 ease-out ${
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
                  <p className={`px-4 py-3 text-base font-medium ${active ? "text-white" : "text-white/75"}`}>
                    {link.label}
                  </p>
                  <Link
                    href="/servicios"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 pl-8 text-sm text-emerald-300/80 hover:text-emerald-200 rounded-xl transition-colors"
                  >
                    <span className="w-1 h-1 rounded-full bg-emerald-400/60" />
                    Todos los servicios
                  </Link>
                  <Link
                    href="/servicios/integrales"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 pl-8 text-sm text-emerald-300/80 hover:text-emerald-200 rounded-xl transition-colors"
                  >
                    <span className="w-1 h-1 rounded-full bg-emerald-400/60" />
                    Cadena de valor
                  </Link>
                  <Link
                    href="/servicios/disposicion"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 pl-8 text-sm text-emerald-300/80 hover:text-emerald-200 rounded-xl transition-colors"
                  >
                    <span className="w-1 h-1 rounded-full bg-emerald-400/60" />
                    Proceso de disposición
                  </Link>
                </div>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-3 text-base font-medium rounded-xl transition-colors ${
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
