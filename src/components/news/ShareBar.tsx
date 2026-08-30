"use client";

import { useEffect, useState } from "react";
import { Check, Link2 } from "lucide-react";
import {
  FacebookIcon,
  TelegramIcon,
  WhatsAppIcon,
  XIcon,
} from "@/components/icons/SocialIcons";

export function ShareBar({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(url);

  useEffect(() => {
    if (url.startsWith("http")) {
      setShareUrl(url);
      return;
    }
    setShareUrl(`${window.location.origin}${url.startsWith("/") ? url : `/${url}`}`);
  }, [url]);

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      className: "bg-[#25D366] hover:bg-[#1ebe57]",
      icon: <WhatsAppIcon className="h-3.5 w-3.5" />,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      className: "bg-[#1877F2] hover:bg-[#1466d2]",
      icon: <FacebookIcon className="h-3.5 w-3.5" />,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      className: "bg-ink hover:bg-ink/90",
      icon: <XIcon className="h-3.5 w-3.5" />,
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      className: "bg-[#229ED9] hover:bg-[#1b8fc4]",
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
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h2 id="share-heading" className="text-sm font-extrabold text-ink">
            Bu haberi paylaş
          </h2>
          <p className="mt-1 text-xs text-ink-soft">Sosyal medyada duyurun veya bağlantıyı kopyalayın.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {links.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex h-10 items-center gap-1.5 px-3.5 text-xs font-bold text-white transition-colors ${item.className}`}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex h-10 items-center gap-1.5 border border-border bg-surface px-3.5 text-xs font-bold text-ink hover:border-brand hover:text-brand"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
            {copied ? "Kopyalandı" : "Bağlantı"}
          </button>
        </div>
      </div>
    </section>
  );
}
