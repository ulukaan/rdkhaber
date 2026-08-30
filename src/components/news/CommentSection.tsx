import { MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { CommentForm } from "@/components/forms/CommentForm";
import { formatRelativeTime } from "@/lib/utils";

export async function CommentSection({ articleId }: { articleId: string }) {
  const [comments, session] = await Promise.all([
    prisma.comment.findMany({
      where: { articleId, approved: true },
      orderBy: { createdAt: "desc" },
    }),
    auth(),
  ]);

  return (
    <section className="mt-10 border border-border bg-white p-5 sm:p-6" aria-labelledby="comments-heading">
      <h2
        id="comments-heading"
        className="mb-2 flex items-center gap-2 text-lg font-extrabold text-ink"
      >
        <MessageSquare className="h-5 w-5 text-brand" aria-hidden />
        Yorumlar {comments.length > 0 ? `(${comments.length})` : ""}
      </h2>
      <p className="mb-5 text-sm text-ink-soft">
        Üye veya ziyaretçi olarak yorum yazabilirsiniz.
      </p>

      <CommentForm articleId={articleId} userName={session?.user?.name} />

      {comments.length === 0 ? (
        <p className="mt-6 border border-dashed border-border bg-surface px-4 py-6 text-sm text-ink-soft">
          Henüz yorum yok. İlk yorumu siz yazın.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col divide-y divide-border border-t border-border">
          {comments.map((c) => (
            <li key={c.id} className="py-4">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-ink">{c.authorName}</span>
                <span className="text-xs text-ink-soft">{formatRelativeTime(c.createdAt)}</span>
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
