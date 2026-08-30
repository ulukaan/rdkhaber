import type { Metadata } from "next";
import Link from "next/link";
import { getGalleries } from "@/lib/galleries";
import { Container } from "@/components/ui/Container";
import { CoverImage } from "@/components/news/CoverImage";
import { LineHeading } from "@/components/home/LineHeading";

export const metadata: Metadata = { title: "Foto Galeri" };

export default async function PhotoGalleryIndexPage() {
  const galleries = await getGalleries(24);

  return (
    <Container className="py-8">
      <LineHeading title="Foto Galeri" as="h1" />
      {galleries.length === 0 ? (
        <p className="border border-dashed border-border bg-surface p-8 text-sm text-ink-soft">
          Henüz galeri yayınlanmadı.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {galleries.map((g) => (
            <Link key={g.id} href={`/foto-galeri/${g.slug}`} className="group block">
              <CoverImage
                src={g.coverImageUrl || g.images[0]?.imageUrl}
                alt={g.title}
                className="aspect-[16/10] w-full"
                sizes="(max-width: 1024px) 50vw, 33vw"
              />
              <h2 className="mt-2 text-base font-extrabold text-ink group-hover:text-brand">
                {g.title}
              </h2>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
