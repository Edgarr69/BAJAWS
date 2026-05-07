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
      </body>
    </html>
  );
}
