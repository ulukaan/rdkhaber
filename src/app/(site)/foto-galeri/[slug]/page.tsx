import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getGalleryBySlug } from "@/lib/galleries";
import { Container } from "@/components/ui/Container";
import { CoverImage } from "@/components/news/CoverImage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);
  if (!gallery) return { title: "Galeri bulunamadı" };
  return { title: gallery.title };
}

export default async function PhotoGalleryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);
  if (!gallery) notFound();

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-ink md:text-3xl">{gallery.title}</h1>
      {gallery.images.length === 0 ? (
        <CoverImage
          src={gallery.coverImageUrl}
          alt={gallery.title}
          className="aspect-[16/9] w-full"
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {gallery.images.map((img) => (
            <li key={img.id}>
              <CoverImage
                src={img.imageUrl}
                alt={img.caption || gallery.title}
                className="aspect-[16/10] w-full"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {img.caption ? (
                <p className="mt-2 text-sm text-ink-soft">{img.caption}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
