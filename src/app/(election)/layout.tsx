import { Footer } from "@/components/layout/Footer";

export const revalidate = 60;

/** Seçim ekranı — site üst menüsü ve piyasa bandı olmadan tam sayfa deneyim. */
export default function ElectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
