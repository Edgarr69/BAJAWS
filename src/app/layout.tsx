import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GoogleTagManager from "@/components/GoogleTagManager";

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
    <html lang="es" className={inter.className} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <GoogleTagManager />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Baja Wastewater Solution",
              "url": "https://bajaws.com.mx",
              "logo": "https://bajaws.com.mx/logoo.webp",
              "image": "https://bajaws.com.mx/images/nosotros.webp",
              "telephone": "(664) 647 5020",
              "email": "damian@bajaws.com.mx",
              "foundingDate": "2009",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Fray Junípero Serra No.17501, Garita de Otay",
                "addressLocality": "Tijuana",
                "addressRegion": "Baja California",
                "postalCode": "22430",
                "addressCountry": "MX",
              },
              "sameAs": [
                "https://www.facebook.com/p/Baja-Wastewater-Solution-S-de-RL-100064142435861/",
                "https://www.linkedin.com/company/baja-waste-water-solution/",
                "https://www.instagram.com/bajawstj/",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
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
