"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { setTipStatusAction, deleteTipAction } from "@/actions/tip";
import { DeleteButton } from "@/components/admin/DeleteButton";

export function TipRowActions({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="panel-row-actions flex items-center justify-end gap-3">
      {status === "PENDING" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => setTipStatusAction(id, "APPROVED"))}
          className="text-ink-soft hover:text-brand"
          title="İncelendi olarak işaretle"
        >
          <Check className="h-4 w-4" />
        </button>
      )}
      <DeleteButton id={id} action={deleteTipAction} />
    </div>
  );
}
