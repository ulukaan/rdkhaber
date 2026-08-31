"use client";

import { useTransition } from "react";
import { approveArticleAction } from "@/actions/article-approval";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

type Row = {
  id: string;
  title: string;
  slug: string;
  updatedAt: Date | string;
  author: { name: string };
};

export function ReviewQueueTable({ items, basePath }: { items: Row[]; basePath: string }) {
  const [pending, startTransition] = useTransition();

  const approve = (id: string) => {
    startTransition(async () => {
      await approveArticleAction(id);
    });
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white px-6 py-12 text-center text-sm text-ink-soft">
        Onay bekleyen haber yok.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white">
      {items.map((item) => (
        <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-bold text-ink">{item.title}</p>
            <p className="text-xs text-ink-soft">
              {item.author.name} · {formatRelativeTime(item.updatedAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`${basePath}/makaleler/${item.id}`}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Düzenle
            </Link>
            <Button type="button" size="sm" disabled={pending} onClick={() => approve(item.id)}>
              Onayla
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
