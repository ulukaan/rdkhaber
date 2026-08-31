import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guard";
import { canEditArticle } from "@/lib/article-access";
import { getArticleForEdit } from "@/lib/articles";
import { listArticleRevisionsAction } from "@/actions/revisions";
import { PageHeader } from "@/components/admin/PageHeader";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: "Revizyon geçmişi" };
}

export default async function ArticleRevisionsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const { id } = await params;
  const article = await getArticleForEdit(id);
  if (!article || !canEditArticle(session, article)) notFound();

  const revisions = await listArticleRevisionsAction(id);
  const base = session.user.role === "ADMIN" ? "/admin" : "/editor";

  return (
    <>
      <PageHeader
        title="Revizyon geçmişi"
        description={article.title}
        action={
          <Link href={`${base}/makaleler/${id}`} className="text-sm font-semibold text-brand hover:underline">
            ← Habere dön
          </Link>
        }
      />
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white">
        {revisions.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-ink-soft">Henüz revizyon yok.</li>
        ) : (
          revisions.map((r) => (
            <li key={r.id} className="px-4 py-3 text-sm">
              <p className="font-bold text-ink">{r.preview.title ?? "—"}</p>
              <p className="text-xs text-ink-soft">
                {r.userName} · {formatDate(r.createdAt)} · durum: {r.preview.status ?? "—"}
              </p>
            </li>
          ))
        )}
      </ul>
    </>
  );
}
