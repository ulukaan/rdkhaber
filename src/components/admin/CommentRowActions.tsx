"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { approveCommentAction, deleteCommentAction } from "@/actions/comment";
import { DeleteButton } from "@/components/admin/DeleteButton";

export function CommentRowActions({ id, approved }: { id: string; approved: boolean }) {
  const [pending, start] = useTransition();

  return (
    <div className="panel-row-actions flex items-center justify-end gap-3">
      {!approved ? (
        <button
          type="button"
          disabled={pending}
          title="Onayla"
          onClick={() => start(() => approveCommentAction(id))}
          className="text-ink-soft hover:text-brand"
        >
          <Check className="h-4 w-4" />
        </button>
      ) : null}
      <DeleteButton id={id} action={deleteCommentAction} />
    </div>
  );
}
