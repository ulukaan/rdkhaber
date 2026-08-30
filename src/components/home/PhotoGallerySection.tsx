import Link from "next/link";
import { Camera } from "lucide-react";
import { CoverImage } from "@/components/news/CoverImage";
import { LineHeading } from "@/components/home/LineHeading";

export type GalleryCard = {
  slug: string;
  title: string;
  coverImageUrl: string | null;
  href: string;
};

function CameraBadge() {
  return (
    <span className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm">
      <Camera className="h-4 w-4" aria-hidden />
    </span>
  );
}

export function PhotoGallerySection({ items }: { items: GalleryCard[] }) {
  if (items.length === 0) return null;
  const [lead, ...rest] = items;
  const side = rest.slice(0, 2);

  return (
    <section className="mt-10" aria-label="Foto Galeri">
      <LineHeading title="Foto Galeri" href="/foto-galeri" />
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Link href={lead.href} className="group relative block overflow-hidden">
          <CoverImage
            src={lead.coverImageUrl}
            alt={lead.title}
            className="aspect-[16/9] w-full"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
          <CameraBadge />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-16">
            <h3 className="text-base font-extrabold leading-snug text-white md:text-lg">
              {lead.title}
            </h3>
          </div>
        </Link>
        <div className="flex flex-col justify-between gap-4">
          {side.map((item) => (
            <Link key={item.slug} href={item.href} className="group flex gap-3">
              <div className="relative w-40 shrink-0 sm:w-48">
                <CoverImage
                  src={item.coverImageUrl}
                  alt={item.title}
                  className="aspect-video w-full"
                  sizes="192px"
                />
                <CameraBadge />
              </div>
              <h3 className="line-clamp-3 pt-0.5 text-sm font-extrabold leading-snug text-ink group-hover:text-brand">
                {item.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
