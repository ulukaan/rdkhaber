import Link from "next/link";
import { CoverImage } from "@/components/news/CoverImage";
import type { ArticleSummary } from "@/types/article";

export function CategoryBandSection({
  title,
  href,
  articles,
}: {
  title: string;
  href: string;
  articles: ArticleSummary[];
}) {
  if (articles.length === 0) return null;
  const [lead, ...rest] = articles;
  const grid = rest.slice(0, 4);

  return (
    <section className="mt-10 bg-white" aria-labelledby="band-heading">
      <Link
        href={href}
        id="band-heading"
        className="mb-4 block bg-brand py-2.5 text-center text-sm font-extrabold uppercase tracking-[0.18em] text-white hover:bg-brand-dark"
      >
        {title}
      </Link>
      <div className="grid gap-5 md:grid-cols-2">
        {lead ? (
          <Link href={`/haber/${lead.slug}`} className="group block">
            <CoverImage
              src={lead.coverImageUrl}
              alt={lead.title}
              color={lead.category.color}
              className="aspect-[16/9] w-full"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <h3 className="mt-3 text-lg font-extrabold leading-snug text-ink group-hover:text-brand md:text-xl">
              {lead.title}
            </h3>
          </Link>
        ) : null}
        <div className="grid grid-cols-2 gap-4">
          {grid.map((article) => (
            <Link key={article.id} href={`/haber/${article.slug}`} className="group block">
              <CoverImage
                src={article.coverImageUrl}
                alt={article.title}
                color={article.category.color}
                className="aspect-[16/10] w-full"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <h3 className="mt-2 line-clamp-3 text-sm font-extrabold leading-snug text-ink group-hover:text-brand">
                {article.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
