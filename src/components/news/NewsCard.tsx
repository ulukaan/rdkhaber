import Link from "next/link";
import { CoverImage } from "@/components/news/CoverImage";
import { Badge } from "@/components/ui/Badge";
import { BreakingImageStamp } from "@/components/news/BreakingBadge";
import { isActiveBreaking } from "@/lib/breaking-news";
import { formatRelativeTime } from "@/lib/utils";
import type { ArticleSummary } from "@/types/article";
import { cn } from "@/lib/utils";
import { HeadlineFace, headlineFromArticle } from "@/components/news/HeadlineFace";

type Variant = "hero" | "stack" | "horizontal" | "vertical" | "compact" | "poster" | "caption";

export function NewsCard({
  article,
  variant = "vertical",
  rank,
  className,
}: {
  article: ArticleSummary;
  variant?: Variant;
  rank?: number;
  className?: string;
}) {
  const href = `/haber/${article.slug}`;

  if (variant === "poster") {
    const color = article.category.color || "#d0021b";
    return (
      <Link
        href={href}
        className={cn(
          "group flex h-full flex-col overflow-hidden border border-border bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand",
          className,
        )}
      >
        <CoverImage
          src={article.coverImageUrl}
          alt={article.title}
          color={article.category.color}
          fallback="wash"
          className="aspect-[16/10] w-full"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
        <div
          className="flex flex-1 flex-col px-3 py-2.5 transition-colors duration-200 group-hover:bg-[var(--cat)] group-hover:text-white"
          style={{ ["--cat" as string]: color }}
        >
          <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft group-hover:text-white/80">
            {article.category.name}
          </span>
          <h3 className="line-clamp-3 text-sm font-extrabold leading-snug text-ink group-hover:text-white md:text-[15px]">
            {article.title}
          </h3>
        </div>
      </Link>
    );
  }

  if (variant === "caption") {
    const color = article.category.color || "#d0021b";
    const breaking = isActiveBreaking(article);
    return (
      <Link
        href={href}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden border border-border bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand",
          className,
        )}
      >
        <div className="relative min-h-[100px] flex-1">
          <CoverImage
            src={article.coverImageUrl}
            alt={article.title}
            color={article.category.color}
            className="h-full min-h-[100px] w-full"
            sizes="(max-width: 1024px) 100vw, 33vw"
          />
          {breaking ? <BreakingImageStamp className="left-2 top-2 sm:left-3 sm:top-3" /> : null}
        </div>
        <div
          className="shrink-0 px-3 py-2.5 transition-colors duration-200 group-hover:bg-[var(--cat)]"
          style={{ ["--cat" as string]: color }}
        >
          <h3 className="line-clamp-3 text-sm font-extrabold leading-snug text-ink group-hover:text-white md:text-[15px]">
            {article.title}
          </h3>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className={cn(
          "group flex items-start gap-3 border-b border-border py-3 last:border-0",
          className,
        )}
      >
        {rank !== undefined && (
          <span className="text-2xl font-black text-border">
            {String(rank).padStart(2, "0")}
          </span>
        )}
        <span className="text-sm font-semibold leading-snug text-ink group-hover:text-brand">
          {article.title}
        </span>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link href={href} className={cn("group flex min-w-0 gap-3 sm:gap-4", className)}>
        <CoverImage
          src={article.coverImageUrl}
          alt={article.title}
          color={article.category.color}
          className="aspect-[4/3] w-24 shrink-0 rounded sm:w-32"
          sizes="128px"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <Badge variant="outline" className="mb-1 w-fit max-w-full truncate">
            {article.category.name}
          </Badge>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink group-hover:text-brand">
            {article.title}
          </h3>
          <span className="mt-1 text-xs text-ink-soft">
            {formatRelativeTime(article.publishedAt ?? new Date())}
          </span>
        </div>
      </Link>
    );
  }

  if (variant === "hero" || variant === "stack") {
    const isHero = variant === "hero";
    const face = headlineFromArticle(article);
    return (
      <Link
        href={href}
        className={cn(
          "group relative block h-full min-h-[220px] overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand",
          isHero && "min-h-[280px] md:min-h-0",
          className,
        )}
      >
        <HeadlineFace
          {...face}
          size={isHero ? "lg" : "md"}
          priority={isHero}
          className="h-full min-h-[inherit]"
          sizes={isHero ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
        />
        {isActiveBreaking(article) ? <BreakingImageStamp /> : null}
      </Link>
    );
  }

  return (
    <Link href={href} className={cn("group block", className)}>
      <CoverImage
        src={article.coverImageUrl}
        alt={article.title}
        color={article.category.color}
        className="aspect-[4/3] w-full rounded"
        sizes="(max-width: 768px) 50vw, 25vw"
      />
      <div className="pt-2">
        <Badge variant="outline" className="mb-1 w-fit">
          {article.category.name}
        </Badge>
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink group-hover:text-brand">
          {article.title}
        </h3>
        <span className="mt-1 block text-xs text-ink-soft">
          {formatRelativeTime(article.publishedAt ?? new Date())}
        </span>
      </div>
    </Link>
  );
}
