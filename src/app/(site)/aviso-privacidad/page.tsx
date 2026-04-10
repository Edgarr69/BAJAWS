import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso de Privacidad | Baja Wastewater Solution",
  description: "Aviso de privacidad de Baja Wastewater Solution conforme a la LFPDPPP.",
};

export default function AvisoPrivacidadPage() {
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen">
      {/* Encabezado */}
      <div className="border-b border-slate-100 py-4 sm:py-5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-2">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Aviso de Privacidad</h1>
          <div className="mt-3 w-10 h-1 bg-emerald-600 rounded-full" />
          <p className="mt-3 text-sm text-gray-400">Última actualización: abril de 2026</p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-gray-700 leading-relaxed">

        {/* I. Responsable */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">I. Identidad y domicilio del Responsable</h2>
          <p>
            <strong>BAJA WASTEWATER SOLUTION</strong>, con domicilio en Fray Junípero Serra No. 17501,
            Garita de Otay, Tijuana, Baja California, C.P. 22430, es responsable del tratamiento de sus
            datos personales conforme a la <em>Ley Federal de Protección de Datos Personales en Posesión
            de los Particulares</em> (LFPDPPP) y su Reglamento.
          </p>
          <p className="mt-2">
            Para cualquier asunto relacionado con este aviso puede contactarnos en:{" "}
            <a href="mailto:damian@bajaws.com.mx" className="text-primary-600 hover:underline">damian@bajaws.com.mx</a>
            {" "}o{" "}
            <a href="mailto:yperalta@bajaws.com.mx" className="text-primary-600 hover:underline">yperalta@bajaws.com.mx</a>.
          </p>
        </section>

        {/* II. Datos recabados */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">II. Datos personales que recabamos</h2>
          <p>A través de los formularios de este sitio web podemos recabar los siguientes datos:</p>
          <ul className="mt-2 ml-5 list-disc space-y-1 text-sm">
            <li>Nombre completo</li>
            <li>Correo electrónico</li>
            <li>Número de teléfono (cuando se proporcione)</li>
            <li>Nombre de empresa (cuando se proporcione)</li>
            <li>Mensaje o consulta</li>
          </ul>
          <p className="mt-3 text-sm">
            No recabamos datos personales sensibles (salud, origen étnico, creencias religiosas, etc.).
          </p>
        </section>

        {/* III. Finalidades */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">III. Finalidades del tratamiento</h2>
          <p className="font-medium text-slate-700 mb-1">Finalidades primarias (necesarias):</p>
          <ul className="ml-5 list-disc space-y-1 text-sm">
            <li>Atender su solicitud de contacto o cotización</li>
            <li>Brindar información sobre nuestros servicios</li>
            <li>Dar seguimiento a sus consultas</li>
          </ul>
          <p className="font-medium text-slate-700 mt-4 mb-1">Finalidades secundarias (opcionales):</p>
          <ul className="ml-5 list-disc space-y-1 text-sm">
            <li>Envío de comunicaciones informativas sobre servicios o actualizaciones</li>
          </ul>
          <p className="mt-3 text-sm">
            Si no desea que sus datos sean tratados para finalidades secundarias, puede manifestarlo
            enviando un correo a cualquiera de las direcciones indicadas en la sección I.
          </p>
        </section>

        {/* IV. Transferencias */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">IV. Transferencias de datos</h2>
          <p>
            Sus datos personales <strong>no son compartidos ni vendidos</strong> a terceros para fines
            comerciales. Únicamente pueden ser transferidos cuando sea exigido por autoridad competente
            o disposición legal aplicable.
          </p>
        </section>

        {/* V. Derechos ARCO */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">V. Derechos ARCO</h2>
          <p>
            Usted tiene derecho a <strong>Acceder</strong> a sus datos personales, <strong>Rectificarlos</strong>,{" "}
            <strong>Cancelarlos</strong> u <strong>Oponerse</strong> a su tratamiento (derechos ARCO).
            Para ejercerlos envíe una solicitud a:
          </p>
          <ul className="mt-2 ml-5 list-disc space-y-1 text-sm">
            <li><a href="mailto:damian@bajaws.com.mx" className="text-primary-600 hover:underline">damian@bajaws.com.mx</a></li>
            <li><a href="mailto:yperalta@bajaws.com.mx" className="text-primary-600 hover:underline">yperalta@bajaws.com.mx</a></li>
          </ul>
          <p className="mt-3 text-sm">
            Su solicitud debe incluir: nombre completo, correo electrónico con el que nos contactó,
            descripción clara del derecho que desea ejercer y copia de identificación oficial.
            Responderemos en un plazo máximo de 20 días hábiles.
          </p>
        </section>

        {/* VI. Cookies */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">VI. Uso de cookies</h2>
          <p>
            Este sitio web utiliza únicamente <strong>cookies esenciales</strong> necesarias para su
            correcto funcionamiento. No utilizamos cookies de seguimiento, publicidad ni análisis de
            comportamiento de terceros.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left px-3 py-2 font-semibold text-slate-700 border border-slate-200">Cookie</th>
                  <th className="text-left px-3 py-2 font-semibold text-slate-700 border border-slate-200">Propósito</th>
                  <th className="text-left px-3 py-2 font-semibold text-slate-700 border border-slate-200">Duración</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2 border border-slate-200 font-mono text-xs">cookie-consent</td>
                  <td className="px-3 py-2 border border-slate-200">Guarda tu preferencia de cookies</td>
                  <td className="px-3 py-2 border border-slate-200">1 año</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="px-3 py-2 border border-slate-200 font-mono text-xs">sb-* (Supabase)</td>
                  <td className="px-3 py-2 border border-slate-200">Sesión de usuario autenticado (solo área privada)</td>
                  <td className="px-3 py-2 border border-slate-200">Sesión</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* VII. Cambios */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">VII. Cambios al aviso de privacidad</h2>
          <p>
            Nos reservamos el derecho de modificar este aviso en cualquier momento. Cualquier cambio
            será publicado en esta página con la fecha de actualización. Le recomendamos revisarlo
            periódicamente.
          </p>
        </section>

        {/* Autoridad */}
        <section className="border-t border-slate-200 pt-6">
          <p className="text-sm text-gray-500">
            Si considera que su derecho a la protección de datos ha sido vulnerado puede acudir al{" "}
            <strong>Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos
            Personales (INAI)</strong> en{" "}
            <a
              href="https://www.inai.org.mx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              www.inai.org.mx
            </a>.
          </p>
        </section>

      </div>
    </div>
  );
}
