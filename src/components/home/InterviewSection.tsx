import Link from "next/link";
import { Mic } from "lucide-react";
import { CoverImage } from "@/components/news/CoverImage";
import { LineHeading } from "@/components/home/LineHeading";
import type { ArticleSummary } from "@/types/article";
import { categoryHref } from "@/lib/category-path";

export function InterviewSection({
  articles,
  href = categoryHref("roportaj"),
}: {
  articles: ArticleSummary[];
  href?: string;
}) {
  if (articles.length === 0) return null;
  const items = articles.slice(0, 4);

  return (
    <section className="mt-10" aria-label="Röportaj">
      <LineHeading title="Röportaj" href={href} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((article) => {
          const guest = article.headlineKicker || article.author?.name || article.category.name;
          return (
            <Link
              key={article.id}
              href={`/haber/${article.slug}`}
              className="group block"
            >
              <div className="relative">
                <CoverImage
                  src={article.coverImageUrl}
                  alt={article.title}
                  color={article.category.color}
                  className="aspect-[16/10] w-full"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <span className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white shadow-sm">
                  <Mic className="h-4 w-4" aria-hidden />
                </span>
              </div>
              <p className="mt-2 text-sm font-extrabold text-brand">{guest}</p>
              <h3 className="mt-1 line-clamp-2 text-[15px] font-extrabold leading-snug text-ink group-hover:text-brand">
                {article.title}
              </h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
