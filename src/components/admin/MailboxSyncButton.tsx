"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { syncMailboxAction } from "@/actions/mailbox";
import { Button } from "@/components/ui/Button";

export function MailboxSyncButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const result = await syncMailboxAction();
            setMessage(
              "message" in result && result.message
                ? result.message
                : result.error ?? "Tamamlandı.",
            );
            router.refresh();
          });
        }}
      >
        <RefreshCw className={`mr-1.5 h-4 w-4 ${pending ? "animate-spin" : ""}`} aria-hidden />
        {pending ? "Alınıyor..." : "Gelen kutusunu al"}
      </Button>
      {message ? <span className="text-xs text-ink-soft">{message}</span> : null}
    </div>
  );
}
