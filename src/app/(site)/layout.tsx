import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-primary-900 focus:font-semibold focus:rounded-lg focus:shadow-lg"
      >
        Ir al contenido principal
      </a>
      <Header />
      {/* Spacer que compensa el header fixed — sincroniza altura con --header-height */}
      <div aria-hidden="true" style={{ height: "var(--header-height, 4rem)" }} />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
