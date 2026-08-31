"use client";

import { useMemo } from "react";
import { FacebookIcon, WhatsAppIcon, XIcon } from "@/components/icons/SocialIcons";
import { resolveShareUrl } from "@/lib/share-url";

export function ShareButtons({
  url,
  title,
  size = "md",
}: {
  url: string;
  title: string;
  size?: "sm" | "md";
}) {
  const shareUrl = useMemo(() => resolveShareUrl(url), [url]);

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const box = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const xIcon = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  const links = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      className: "bg-[#25D366] hover:bg-[#1ebe57]",
      content: <WhatsAppIcon className={icon} />,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      className: "bg-ink hover:bg-ink/90",
      content: <XIcon className={xIcon} />,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      className: "bg-[#1877F2] hover:bg-[#1466d2]",
      content: <FacebookIcon className={icon} />,
    },
  ];

  return (
    <div className="flex items-center gap-1">
      {links.map(({ label, href, className, content }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label} ile paylaş`}
          title={`${label} ile paylaş`}
          className={`flex ${box} items-center justify-center rounded-sm text-white transition-colors ${className}`}
        >
          {content}
        </a>
      ))}
    </div>
  );
}
