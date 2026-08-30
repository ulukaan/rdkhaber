import { CoverImage } from "@/components/news/CoverImage";
import { cn } from "@/lib/utils";
import type { ArticleSummary } from "@/types/article";

export type HeadlineAlign = "left" | "center" | "right";

export function headlineFromArticle(article: ArticleSummary) {
  const align = article.headlineAlign;
  const imageAlign = article.headlineImageAlign;
  return {
    title: article.headlineTitle?.trim() || article.title,
    kicker: article.headlineKicker?.trim() || article.category.name,
    sub: article.headlineSub?.trim() || null,
    align: (align === "center" || align === "right" ? align : "left") as HeadlineAlign,
    imageAlign: (imageAlign === "left" || imageAlign === "right" ? imageAlign : "center") as HeadlineAlign,
    color: article.category.color,
    coverImageUrl: article.coverImageUrl,
  };
}

export type HeadlineFaceProps = {
  title: string;
  kicker?: string | null;
  sub?: string | null;
  coverImageUrl?: string | null;
  color?: string | null;
  align?: HeadlineAlign;
  imageAlign?: HeadlineAlign;
  size?: "sm" | "md" | "lg";
  priority?: boolean;
  sizes?: string;
  className?: string;
};

const IMAGE_POS: Record<HeadlineAlign, string> = {
  left: "left center",
  center: "center",
  right: "right center",
};

const GRADIENT: Record<HeadlineAlign, string> = {
  left: "bg-gradient-to-r from-ink/90 via-ink/45 to-transparent",
  center: "bg-gradient-to-t from-ink/85 via-ink/35 to-ink/10",
  right: "bg-gradient-to-l from-ink/90 via-ink/45 to-transparent",
};

export function HeadlineFace({
  title,
  kicker,
  sub,
  coverImageUrl,
  color,
  align = "left",
  imageAlign = "center",
  size = "md",
  priority,
  sizes,
  className,
}: HeadlineFaceProps) {
  const textAlign =
    align === "center" ? "items-center text-center" : align === "right" ? "items-end text-right" : "items-start text-left";

  return (
    <div className={cn("relative h-full min-h-[160px] overflow-hidden", className)}>
      <CoverImage
        src={coverImageUrl}
        alt={title}
        color={color}
        priority={priority}
        objectPosition={IMAGE_POS[imageAlign]}
        className="absolute inset-0 h-full w-full"
        sizes={sizes}
      />
      <div className={cn("absolute inset-0", GRADIENT[align])} />
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-center",
          textAlign,
          size === "lg" ? "p-5 md:p-8" : size === "sm" ? "p-3" : "p-4 md:p-5",
        )}
      >
        {kicker ? (
          <span className="mb-1.5 max-w-[92%] text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">
            {kicker}
          </span>
        ) : null}
        {size === "lg" ? (
          <h2 className="max-w-[92%] line-clamp-3 text-xl font-extrabold leading-[1.15] text-white md:text-3xl">
            {title}
          </h2>
        ) : (
          <h3
            className={cn(
              "max-w-[92%] line-clamp-3 font-extrabold leading-[1.15] text-white",
              size === "sm" ? "text-sm md:text-base" : "text-[15px] md:text-lg",
            )}
          >
            {title}
          </h3>
        )}
        {sub ? (
          <p className="mt-2 max-w-[88%] line-clamp-2 text-xs font-medium text-white/80 md:text-sm">
            {sub}
          </p>
        ) : null}
      </div>
    </div>
  );
}
