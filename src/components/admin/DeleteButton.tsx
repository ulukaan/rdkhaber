"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

type DeleteAction = (id: string) => Promise<{ error?: string } | undefined | void>;

export function DeleteButton({
  id,
  action,
  confirmText = "Bu kaydı silmek istediğinize emin misiniz?",
}: {
  id: string;
  action: DeleteAction;
  confirmText?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDelete = () => {
    startTransition(async () => {
      const result = await action(id);
      if (result?.error) {
        setError(result.error);
        setConfirming(false);
      }
    });
  };

  if (confirming) {
    return (
      <span className="flex items-center gap-1.5 text-xs">
        <button
          type="button"
          disabled={pending}
          onClick={runDelete}
          className="font-semibold text-brand hover:underline"
        >
          {pending ? "Siliniyor..." : "Emin misin?"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-ink-soft hover:underline"
        >
          Vazgeç
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        title={confirmText}
        onClick={() => setConfirming(true)}
        className="text-ink-soft hover:text-brand"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {error && <span className="text-xs font-medium text-brand">{error}</span>}
    </span>
  );
}
