"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  listNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/actions/notifications";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime } from "@/lib/utils";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationList({ initial }: { initial: NotificationItem[] }) {
  const [items, setItems] = useState(initial);
  const [pending, startTransition] = useTransition();

  const unread = items.filter((n) => !n.readAt).length;

  const refresh = () => {
    startTransition(async () => {
      const next = await listNotificationsAction();
      setItems(next);
    });
  };

  const markRead = (id: string) => {
    startTransition(async () => {
      await markNotificationReadAction(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
      );
    });
  };

  const markAll = () => {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    });
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white px-6 py-12 text-center text-sm text-ink-soft">
        Henüz bildirim yok.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-soft">
          {unread > 0 ? `${unread} okunmamış bildirim` : "Tüm bildirimler okundu"}
        </p>
        <div className="flex gap-2">
          {unread > 0 ? (
            <Button type="button" size="sm" variant="outline" onClick={markAll} disabled={pending}>
              Tümünü okundu işaretle
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="ghost" onClick={refresh} disabled={pending}>
            Yenile
          </Button>
        </div>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white">
        {items.map((n) => (
          <li
            key={n.id}
            className={`px-4 py-3 ${n.readAt ? "bg-white" : "bg-brand/5"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink">{n.title}</p>
                <p className="mt-1 text-sm text-ink-soft">{n.body}</p>
                <p className="mt-2 text-[11px] text-ink-soft">
                  {formatRelativeTime(new Date(n.createdAt))}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                {n.href ? (
                  <Link
                    href={n.href}
                    className="text-xs font-semibold text-brand hover:underline"
                    onClick={() => !n.readAt && markRead(n.id)}
                  >
                    Görüntüle
                  </Link>
                ) : null}
                {!n.readAt ? (
                  <button
                    type="button"
                    className="text-xs font-semibold text-ink-soft hover:text-brand"
                    onClick={() => markRead(n.id)}
                    disabled={pending}
                  >
                    Okundu
                  </button>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
