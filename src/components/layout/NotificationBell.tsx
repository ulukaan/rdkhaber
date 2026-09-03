"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import {
  getRecentNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/actions/notifications";
import { cn, formatRelativeTime } from "@/lib/utils";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationBell({
  initialCount,
  initialItems,
}: {
  initialCount: number;
  initialItems: NotificationItem[];
}) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [items, setItems] = useState(initialItems);
  const [pending, start] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const refresh = () => {
    start(async () => {
      const next = await getRecentNotificationsAction(6);
      setItems(next);
      setCount(next.filter((item) => !item.readAt).length);
    });
  };

  const markRead = (id: string) => {
    start(async () => {
      await markNotificationReadAction(id);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, readAt: new Date().toISOString() } : item,
        ),
      );
      setCount((prev) => Math.max(0, prev - 1));
    });
  };

  const markAll = () => {
    start(async () => {
      await markAllNotificationsReadAction();
      setItems((prev) =>
        prev.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })),
      );
      setCount(0);
    });
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          if (!open) refresh();
        }}
        aria-expanded={open}
        aria-label={count > 0 ? `${count} okunmamış bildirim` : "Bildirimler"}
        className="relative flex h-9 w-9 items-center justify-center border border-border bg-white text-ink transition-colors hover:border-brand hover:text-brand"
      >
        <Bell className="h-4 w-4" />
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-brand px-1 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-bold text-ink">Bildirimler</span>
            {count > 0 ? (
              <button
                type="button"
                onClick={markAll}
                disabled={pending}
                className="text-xs font-semibold text-brand hover:underline"
              >
                Tümünü okundu işaretle
              </button>
            ) : null}
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-ink-soft">Henüz bildirim yok.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    "border-b border-border/70 px-4 py-3 last:border-b-0",
                    !item.readAt && "bg-brand/[0.04]",
                  )}
                >
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{item.body}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-ink-soft">
                      {formatRelativeTime(new Date(item.createdAt))}
                    </span>
                    {item.href ? (
                      <Link
                        href={item.href}
                        onClick={() => {
                          if (!item.readAt) markRead(item.id);
                          setOpen(false);
                        }}
                        className="text-xs font-semibold text-brand hover:underline"
                      >
                        Görüntüle
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-border px-4 py-3">
            <Link
              href="/hesabim/bildirimler"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Tüm bildirimleri gör
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
