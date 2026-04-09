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
      <Header />
      {/* Spacer que compensa el header fixed — sincroniza altura con --header-height */}
      <div aria-hidden="true" className="bg-primary-900" style={{ height: "var(--header-height, 4rem)" }} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
