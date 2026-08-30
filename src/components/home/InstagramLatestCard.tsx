import Link from "next/link";
import type { InstagramPost } from "@/lib/instagram";
import { InstagramIcon } from "@/components/icons/SocialIcons";

export function InstagramLatestCard({ post }: { post: InstagramPost }) {
  return (
    <div className="mx-auto w-full max-w-[320px] overflow-hidden border border-border bg-white lg:mx-0 lg:max-w-none">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white">
            <InstagramIcon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink">
              Instagram
            </p>
            <p className="truncate text-xs text-ink-soft">@{post.username}</p>
          </div>
        </div>
        <Link
          href={`https://www.instagram.com/${post.username}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs font-semibold text-brand hover:underline"
        >
          Takip et
        </Link>
      </div>

      <Link
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <div className="relative w-full overflow-hidden bg-[#f3f3f3]">
          <div className="relative aspect-[4/5] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt={post.caption || "Son Instagram paylaşımı"}
              className="absolute inset-0 h-full w-full object-contain object-center p-0.5"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
        {post.caption ? (
          <p className="line-clamp-3 px-4 py-3 text-sm leading-relaxed text-ink-soft group-hover:text-ink">
            {post.caption}
          </p>
        ) : null}
      </Link>
    </div>
  );
}
