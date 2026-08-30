import Link from "next/link";
import { CoverImage } from "@/components/news/CoverImage";
import { LineHeading } from "@/components/home/LineHeading";
import { categoryHref } from "@/lib/category-path";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { ArticleSummary } from "@/types/article";
import type { CategoryBlockLayout } from "@/lib/settings";

export type CategoryNewsBlock = {
  name: string;
  slug: string;
  color: string | null;
  layout: CategoryBlockLayout;
  articles: ArticleSummary[];
};

function NewsFrame({
  article,
  sizes,
  excerpt = false,
  imageClass,
}: {
  article: ArticleSummary;
  sizes: string;
  excerpt?: boolean;
  imageClass?: string;
}) {
  const color = article.category.color || "#d0021b";
  const published = article.publishedAt ? new Date(article.publishedAt) : null;

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
        className={cn("w-full", imageClass ?? "aspect-[16/10]")}
        sizes={sizes}
      />
      <div
        className="flex flex-1 flex-col px-3 py-2.5 transition-colors duration-200 group-hover:bg-[var(--cat)] group-hover:text-white"
        style={{ ["--cat" as string]: color }}
      >
        <h3
          className={cn(
            "font-extrabold leading-snug text-ink group-hover:text-white",
            excerpt ? "line-clamp-3 text-[15px] md:text-lg" : "line-clamp-3 text-[13px]",
          )}
        >
          {article.title}
        </h3>
        {excerpt && article.summary ? (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-soft group-hover:text-white/85">
            {article.summary}
          </p>
        ) : null}
        {published && !Number.isNaN(published.getTime()) ? (
          <time
            dateTime={published.toISOString()}
            className="mt-2 text-[11px] font-medium text-ink-soft group-hover:text-white/80"
          >
            {formatRelativeTime(published)}
          </time>
        ) : null}
      </div>
    </Link>
  );
}

function Layout3({ articles }: { articles: ArticleSummary[] }) {
  const [lead, ...rest] = articles;
  const grid = rest.slice(0, 4);
  if (!lead) return null;

  if (grid.length === 0) {
    return (
      <div className="max-w-xl">
        <NewsFrame
          article={lead}
          excerpt
          imageClass="aspect-[16/9] min-h-[180px] md:min-h-[220px]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    );
  }

  return (
    <div className="grid items-stretch gap-2.5 md:grid-cols-2">
      <NewsFrame
        article={lead}
        excerpt
        imageClass="aspect-[16/9] min-h-[180px] md:min-h-[220px]"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div
        className={cn(
          "grid gap-2.5",
          grid.length === 1 ? "grid-cols-1" : "grid-cols-2",
        )}
      >
        {grid.map((article) => (
          <NewsFrame
            key={article.id}
            article={article}
            imageClass="aspect-[16/10]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ))}
      </div>
    </div>
  );
}

function Layout4({ articles }: { articles: ArticleSummary[] }) {
  const row = articles.slice(0, 4);
  if (row.length === 0) return null;

  const cols =
    row.length === 1
      ? "grid-cols-1 max-w-md"
      : row.length === 2
        ? "grid-cols-2"
        : row.length === 3
          ? "grid-cols-2 md:grid-cols-3"
          : "grid-cols-2 md:grid-cols-4";

  return (
    <div className={cn("grid gap-2.5", cols)}>
      {row.map((article) => (
        <NewsFrame
          key={article.id}
          article={article}
          imageClass="aspect-[16/10]"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      ))}
    </div>
  );
}

function Layout5({ articles }: { articles: ArticleSummary[] }) {
  const [lead, ...rest] = articles;
  const grid = rest.slice(0, 4);
  if (!lead) return null;

  if (grid.length === 0) {
    return (
      <div className="max-w-xl">
        <NewsFrame
          article={lead}
          excerpt
          imageClass="aspect-[16/9]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    );
  }

  return (
    <div className="grid gap-2.5 md:grid-cols-2">
      <NewsFrame
        article={lead}
        excerpt
        imageClass="aspect-[16/9]"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div
        className={cn(
          "grid gap-2.5",
          grid.length === 1 ? "grid-cols-1" : "grid-cols-2",
        )}
      >
        {grid.map((article) => (
          <NewsFrame
            key={article.id}
            article={article}
            imageClass="aspect-[16/10]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ))}
      </div>
    </div>
  );
}

export function CategoryNewsBlocks({ blocks }: { blocks: CategoryNewsBlock[] }) {
  const visible = blocks.filter((b) => b.articles.length > 0);
  if (visible.length === 0) return null;

  return (
    <div className="mt-6 flex flex-col gap-7">
      {visible.map((block) => (
        <section key={block.slug} aria-label={block.name}>
          <LineHeading title={block.name} href={categoryHref(block.slug)} accent={block.color} />
          {block.layout === "4" ? (
            <Layout4 articles={block.articles} />
          ) : block.layout === "5" ? (
            <Layout5 articles={block.articles} />
          ) : (
            <Layout3 articles={block.articles} />
          )}
        </section>
      ))}
    </div>
  );
}
