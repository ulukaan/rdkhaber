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

/** Görsel üstü gradyan — tema bağımsız siyah (koyu modda --ink açık renge döner). */
export const HEADLINE_OVERLAY = {
  bottom: "bg-gradient-to-t from-black/90 via-black/35 to-black/5",
  bottomStrong: "bg-gradient-to-t from-black/92 via-black/40 to-transparent",
  left: "bg-gradient-to-r from-black/90 via-black/45 to-transparent",
  center: "bg-gradient-to-t from-black/85 via-black/35 to-black/10",
  right: "bg-gradient-to-l from-black/90 via-black/45 to-transparent",
} as const;

export const HEADLINE_TITLE_SHADOW =
  "drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]";

const GRADIENT: Record<HeadlineAlign, string> = {
  left: HEADLINE_OVERLAY.left,
  center: HEADLINE_OVERLAY.center,
  right: HEADLINE_OVERLAY.right,
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
          <span className={cn("mb-1.5 max-w-[92%] text-[10px] font-bold uppercase tracking-[0.16em] text-white/90", HEADLINE_TITLE_SHADOW)}>
            {kicker}
          </span>
        ) : null}
        {size === "lg" ? (
          <h2 className={cn("max-w-[92%] line-clamp-3 text-xl font-extrabold leading-[1.15] text-white md:text-3xl", HEADLINE_TITLE_SHADOW)}>
            {title}
          </h2>
        ) : (
          <h3
            className={cn(
              "max-w-[92%] line-clamp-3 font-extrabold leading-[1.15] text-white",
              HEADLINE_TITLE_SHADOW,
              size === "sm" ? "text-sm md:text-base" : "text-[15px] md:text-lg",
            )}
          >
            {title}
          </h3>
        )}
        {sub ? (
          <p className={cn("mt-2 max-w-[88%] line-clamp-2 text-xs font-medium text-white/85 md:text-sm", HEADLINE_TITLE_SHADOW)}>
            {sub}
          </p>
        ) : null}
      </div>
    </div>
  );
}
