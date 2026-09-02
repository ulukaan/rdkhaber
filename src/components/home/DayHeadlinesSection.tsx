import Link from "next/link";
import { CoverImage } from "@/components/news/CoverImage";
import { LineHeading } from "@/components/home/LineHeading";
import { cn } from "@/lib/utils";
import type { ArticleSummary } from "@/types/article";

function DayCard({
  article,
  excerpt = false,
  imageClass,
  titleClass,
  sizes,
}: {
  article: ArticleSummary;
  excerpt?: boolean;
  imageClass: string;
  titleClass: string;
  sizes: string;
}) {
  const color = article.category.color || "#d0021b";

  return (
    <Link
      href={`/haber/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden border border-border bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
    >
      <CoverImage
        src={article.coverImageUrl}
        alt={article.title}
        color={article.category.color}
        fallback="wash"
        className={cn("w-full", imageClass)}
        sizes={sizes}
      />
      <div
        className="flex flex-1 flex-col px-3 py-2.5 transition-colors duration-200 group-hover:bg-[var(--cat)] group-hover:text-white"
        style={{ ["--cat" as string]: color }}
      >
        <h3
          className={cn(
            "font-extrabold leading-snug text-ink group-hover:text-white",
            titleClass,
          )}
        >
          {article.title}
        </h3>
        {excerpt && article.summary ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft group-hover:text-white/85">
            {article.summary}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export function DayHeadlinesSection({ articles }: { articles: ArticleSummary[] }) {
  if (articles.length === 0) return null;
  const [lead, ...rest] = articles;
  const grid = rest.slice(0, 4);

  return (
    <section aria-label="Günün Manşetleri">
      <LineHeading title="Günün Manşetleri" href="/" />
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        {lead ? (
          <DayCard
            article={lead}
            excerpt
            imageClass="aspect-[16/9]"
            titleClass="line-clamp-3 text-xl md:text-2xl"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : null}
        <div className="grid grid-cols-2 gap-4">
          {grid.map((article) => (
            <DayCard
              key={article.id}
              article={article}
              imageClass="aspect-[16/10]"
              titleClass="line-clamp-3 text-sm"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
