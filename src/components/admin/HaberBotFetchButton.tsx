"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import {
  fetchAllHaberBotSourcesAction,
  fetchHaberBotSourceAction,
} from "@/actions/haber-bot";
import { Button } from "@/components/ui/Button";
import type { FetchResult } from "@/lib/haber-bot/import";

function formatResult(result: FetchResult) {
  if (result.error && result.imported === 0 && result.skipped === 0) {
    return result.error;
  }
  const parts = [`${result.imported} haber eklendi`, `${result.skipped} atlandı`];
  if (result.failed) parts.push(`${result.failed} hata`);
  if (result.error) parts.push(result.error);
  return parts.join(" · ");
}

export function HaberBotFetchButton({
  sourceId,
  label = "Şimdi çek",
  size = "sm",
}: {
  sourceId?: string;
  label?: string;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const run = () => {
    setMessage(null);
    startTransition(async () => {
      const result = sourceId
        ? await fetchHaberBotSourceAction(sourceId)
        : await fetchAllHaberBotSourcesAction();
      setMessage(formatResult(result));
      router.refresh();
    });
  };

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Button type="button" size={size} onClick={run} disabled={pending}>
        <Download className="h-4 w-4" />
        {pending ? "Çekiliyor..." : label}
      </Button>
      {message ? <span className="max-w-xs text-right text-xs text-ink-soft">{message}</span> : null}
    </span>
  );
}
