import Link from "next/link";
import Image from "next/image";
import { siteContent } from "@/content/site";

export default function Footer() {
  const { links } = siteContent.footer;
  const landingLink = { label: "Solicitar cotización", href: "/tratamiento-aguas-residuales" };
  const { name } = siteContent.company;
  const { info } = siteContent.contacto;
  const year = new Date().getFullYear();

  const autoridades = ["SEMARNAT", "CESPT", "SEMAR", "SCT"];

  return (
    <footer className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <div className="mb-4">
              <Image
                src="/logoo.webp"
                alt="Baja Wastewater Solution"
                width={160}
                height={62}
                sizes="160px"
                className="h-9 w-auto object-contain"
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empresa tratadora de aguas industriales residuales con más de 14 años de experiencia en Baja California.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-widest text-gray-400 mb-4">
              Navegación
            </h3>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-secondary-400 text-sm transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={landingLink.href}
                  className="text-secondary-400 hover:text-secondary-300 text-sm font-medium transition-colors duration-150"
                >
                  {landingLink.label} →
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-widest text-gray-400 mb-4">
              Contacto
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex gap-2 text-gray-300">
                <svg className="w-4 h-4 text-secondary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{info.direccion}</span>
              </li>
              <li className="flex gap-2">
                <svg className="w-4 h-4 text-secondary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${info.telefono.replace(/\D/g, "")}`} className="text-gray-300 hover:text-secondary-400 transition-colors">
                  {info.telefono}
                </a>
              </li>
              <li className="flex gap-2">
                <svg className="w-4 h-4 text-secondary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="flex flex-col gap-0.5">
                  <a href={`mailto:${info.correo}`} className="text-gray-300 hover:text-secondary-400 transition-colors break-all">
                    {info.correo}
                  </a>
                  <a href={`mailto:${info.correo2}`} className="text-gray-300 hover:text-secondary-400 transition-colors break-all">
                    {info.correo2}
                  </a>
                </div>
              </li>
              <li className="flex gap-2 text-gray-300">
                <svg className="w-4 h-4 text-secondary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{info.horario}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Autorizados por */}
        <div className="mt-10 pt-6 border-t border-slate-700">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-4">
            Autorizados por
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {autoridades.map((dep) => (
              <span
                key={dep}
                className="inline-flex items-center gap-1.5 bg-slate-700/50 border border-slate-600 text-slate-300 text-xs font-medium px-3 py-1.5 rounded-full"
              >
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {dep}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-slate-700 text-center space-y-3">
          {/* Redes sociales */}
          <div className="flex justify-center gap-5">
            <a
              href="https://www.facebook.com/p/Baja-Wastewater-Solution-S-de-RL-100064142435861/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-gray-500 hover:text-[#1877F2] transition-colors duration-150"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/company/baja-waste-water-solution/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-gray-500 hover:text-[#0A66C2] transition-colors duration-150"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/bajawstj/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-gray-500 hover:text-[#E1306C] transition-colors duration-150"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
          <p className="text-gray-500 text-sm">
            © {year} {name}. Todos los derechos reservados.
          </p>
          <p className="text-gray-500 text-sm">
            Hecho por Edgar Cabrera.
          </p>
        </div>
      </div>
    </footer>
  );
}
