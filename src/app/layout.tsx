import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteContent } from "@/content/site";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://bajaws.com.mx"
  ),
  title: {
    default: "Baja Wastewater Solution",
    template: "%s | Baja Wastewater Solution",
  },
  description:
    "Empresa de soluciones para el tratamiento de aguas residuales industriales en Baja California.",
  openGraph: {
    siteName: "Baja Wastewater Solution",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-MX" className={inter.className} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              // LocalBusiness es subtipo de Organization — entidad única del negocio
              "@type": "LocalBusiness",
              "@id": "https://bajaws.com.mx/#organization",
              "name": siteContent.company.name,
              "description": "Empresa certificada en tratamiento de aguas residuales industriales y gestión de residuos peligrosos en México. Autorizaciones SEMARNAT, CESPT, SEMAR y SCT.",
              "url": "https://bajaws.com.mx",
              "logo": "https://bajaws.com.mx/logoo.webp",
              "image": "https://bajaws.com.mx/images/nosotros.webp",
              "telephone": "+52-664-647-5020",
              "email": siteContent.contacto.info.correo,
              "foundingDate": String(siteContent.company.foundingYear),
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Fray Junípero Serra No.17501, Garita de Otay",
                "addressLocality": "Tijuana",
                "addressRegion": "Baja California",
                "postalCode": "22430",
                "addressCountry": "MX",
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "08:00",
                "closes": "17:00",
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 32.5368,
                "longitude": -116.9320,
              },
              "areaServed": [
                { "@type": "Country", "name": "México" },
                { "@type": "State", "name": "Baja California" },
                { "@type": "City", "name": "Tijuana" },
                { "@type": "City", "name": "Tecate" },
                { "@type": "City", "name": "Mexicali" },
                { "@type": "City", "name": "Ensenada" },
              ],
              "sameAs": [
                "https://www.facebook.com/p/Baja-Wastewater-Solution-S-de-RL-100064142435861/",
                "https://www.linkedin.com/company/baja-waste-water-solution/",
                "https://www.instagram.com/bajawstj/",
              ],
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Servicios de gestión de residuos industriales",
                "itemListElement": [
                  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Recolección y transporte" } },
                  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Tratamiento de aguas residuales" } },
                  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Acopio temporal" } },
                  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Reciclaje y revalorización" } },
                  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Servicios de remediación" } },
                  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Residuos de manejo especial" } },
                ],
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://bajaws.com.mx/#website",
              "url": "https://bajaws.com.mx",
              "name": "Baja Wastewater Solution",
              "inLanguage": "es-MX",
            }),
          }}
        />
      </body>
    </html>
  );
}
