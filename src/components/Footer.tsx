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
                src="/logoo.png"
                alt="Baja Wastewater Solution"
                width={160}
                height={62}
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
        <div className="mt-8 pt-6 border-t border-slate-700 text-center">
          <p className="text-gray-500 text-sm">
            © {year} {name}. Todos los derechos reservados. 
          </p>
        </div>
      </div>
    </footer>
  );
}
