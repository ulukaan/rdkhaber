"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X as XIcon } from "lucide-react";
import { approveSubmissionAction, rejectSubmissionAction, deleteSubmissionAction } from "@/actions/submission";
import { DeleteButton } from "@/components/admin/DeleteButton";

export function SubmissionRowActions({
  id,
  status,
  basePath,
}: {
  id: string;
  status: string;
  basePath: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const approve = () =>
    startTransition(async () => {
      const result = await approveSubmissionAction(id);
      if (result?.articleId) router.push(`${basePath}/makaleler/${result.articleId}`);
    });

  return (
    <div className="flex items-center justify-end gap-3">
      {status === "PENDING" && (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={approve}
            className="text-ink-soft hover:text-brand"
            title="Onayla ve taslak oluştur"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => rejectSubmissionAction(id))}
            className="text-ink-soft hover:text-brand"
            title="Reddet"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </>
      )}
      <DeleteButton id={id} action={deleteSubmissionAction} />
    </div>
  );
}
