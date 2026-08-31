"use client";

import { useTransition } from "react";
import { resolveComplaintAction } from "@/actions/content-complaint";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

type Row = {
  id: string;
  name: string;
  email: string;
  articleUrl: string | null;
  message: string;
  status: string;
  createdAt: Date;
};

export function ComplaintsTable({ items }: { items: Row[] }) {
  const [pending, startTransition] = useTransition();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white px-6 py-12 text-center text-sm text-ink-soft">
        Şikayet yok.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white">
      {items.map((item) => (
        <li key={item.id} className="px-4 py-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-bold text-ink">{item.name}</p>
              <p className="text-xs text-ink-soft">
                {item.email} · {formatDate(item.createdAt)}
              </p>
            </div>
            {item.status === "PENDING" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  startTransition(() => {
                    void resolveComplaintAction(item.id);
                  })
                }
              >
                Çözüldü
              </Button>
            ) : (
              <span className="text-xs font-semibold text-emerald-700">Çözüldü</span>
            )}
          </div>
          {item.articleUrl ? (
            <p className="mt-2 break-all text-xs text-brand">{item.articleUrl}</p>
          ) : null}
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">{item.message}</p>
        </li>
      ))}
    </ul>
  );
}
