"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { authorHref } from "@/lib/author-path";
import { SafeMediaImage } from "@/components/ui/SafeMediaImage";

export function AuthorByline({
  name,
  author,
  className,
}: {
  name: string;
  author?: { id?: string; slug?: string | null; avatarUrl?: string | null } | null;
  className?: string;
}) {
  const href = authorHref(author ?? null);
  const label = name.trim();
  if (!label) return null;

  const avatar = author?.avatarUrl ? (
    <SafeMediaImage
      src={author.avatarUrl}
      fallbackName={label}
      variant="avatar"
      iconFallback
      className="h-7 w-7 rounded-full object-cover"
    />
  ) : (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-ink-soft">
      <User className="h-3.5 w-3.5" aria-hidden />
    </span>
  );

  const inner = (
    <>
      {avatar}
      <span>
        <span className="text-ink-soft">Yazar · </span>
        <span className="font-extrabold text-ink">{label}</span>
      </span>
    </>
  );

  if (!href) {
    return <p className={className ?? "mt-4 flex items-center gap-2 text-sm"}>{inner}</p>;
  }

  return (
    <p className={className ?? "mt-4 text-sm"}>
      <Link href={href} className="inline-flex items-center gap-2 hover:text-brand">
        {inner}
      </Link>
    </p>
  );
}
