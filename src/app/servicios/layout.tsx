import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ServiciosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div aria-hidden="true" style={{ height: "var(--header-height, 4rem)", transition: "height 300ms" }} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
