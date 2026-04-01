import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* Spacer que compensa el header fixed — sincroniza altura con --header-height */}
      <div aria-hidden="true" style={{ height: "var(--header-height, 4rem)", transition: "height 300ms" }} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
