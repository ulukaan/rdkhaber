import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { CoverImage } from "@/components/news/CoverImage";
import { cn } from "@/lib/utils";
import type { ArticleSummary } from "@/types/article";

export function VideoCard({
  article,
  className,
}: {
  article: ArticleSummary;
  className?: string;
}) {
  return (
    <Link
      href={`/haber/${article.slug}`}
      className={cn("group block", className)}
    >
      <div className="relative">
        <CoverImage
          src={article.coverImageUrl}
          alt={article.title}
          color={article.category.color}
          className="aspect-video w-full rounded"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <PlayCircle
          className="absolute inset-0 m-auto h-12 w-12 text-white drop-shadow-lg transition-transform group-hover:scale-110"
          strokeWidth={1.5}
        />
      </div>
      <h3 className="line-clamp-2 pt-2 text-sm font-bold leading-snug text-ink group-hover:text-brand">
        {article.title}
      </h3>
    </Link>
  );
}
