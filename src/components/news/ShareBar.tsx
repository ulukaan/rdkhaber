"use client";

import { useMemo, useState } from "react";
import { Check, Link2 } from "lucide-react";
import {
  FacebookIcon,
  TelegramIcon,
  WhatsAppIcon,
  XIcon,
} from "@/components/icons/SocialIcons";
import { BookmarkButton } from "@/components/account/BookmarkButton";
import { resolveShareUrl } from "@/lib/share-url";
import { cn } from "@/lib/utils";

const tileClass =
  "flex min-h-[4.75rem] w-full flex-col items-center justify-center gap-1.5 rounded-lg bg-surface px-1 py-3 text-[11px] font-bold text-ink transition-colors hover:bg-border/60";

export function ShareBar({ url, title, articleId }: { url: string; title: string; articleId?: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = useMemo(() => resolveShareUrl(url), [url]);

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      iconClass: "bg-[#25D366]",
      icon: <WhatsAppIcon className="h-3.5 w-3.5" />,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      iconClass: "bg-[#1877F2]",
      icon: <FacebookIcon className="h-3.5 w-3.5" />,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      iconClass: "bg-[#14171a] ring-1 ring-white/20",
      icon: <XIcon className="h-3.5 w-3.5" />,
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      iconClass: "bg-[#229ED9]",
      icon: <TelegramIcon className="h-3.5 w-3.5" />,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section
      className="mt-8 overflow-hidden border border-border bg-white"
      aria-labelledby="share-heading"
    >
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <h2 id="share-heading" className="text-sm font-extrabold text-ink">
          Bu haberi paylaş
        </h2>
        <p className="mt-0.5 text-xs text-ink-soft">Sosyal medyada duyurun veya bağlantıyı kopyalayın.</p>
      </div>
      <div
        className={cn(
          "grid gap-2 p-3",
          articleId ? "grid-cols-3 sm:grid-cols-6" : "grid-cols-3 sm:grid-cols-5",
        )}
      >
        {links.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={tileClass}
          >
            <span
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full text-white",
                item.iconClass,
              )}
            >
              {item.icon}
            </span>
            {item.label}
          </a>
        ))}
        <button type="button" onClick={copyLink} className={tileClass}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-ink">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
          </span>
          {copied ? "Kopyalandı" : "Bağlantı"}
        </button>
        {articleId ? <BookmarkButton articleId={articleId} variant="tile" /> : null}
      </div>
    </section>
  );
}
