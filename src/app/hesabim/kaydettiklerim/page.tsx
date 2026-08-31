import Link from "next/link";
import { requireAuth } from "@/lib/auth-guard";
import { PageHeader } from "@/components/admin/PageHeader";
import { NewsCard } from "@/components/news/NewsCard";
import { BookmarkButton } from "@/components/account/BookmarkButton";
import { getBookmarkedArticles } from "@/lib/library";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Kaydettiklerim" };

export default async function SavedArticlesPage() {
  const session = await requireAuth();
  const rows = await getBookmarkedArticles(session.user.id, 60);

  return (
    <>
      <PageHeader
        title="Kaydettiklerim"
        description="Daha sonra okumak için kaydettiğiniz haberler."
      />
      {rows.length === 0 ? (
        <p className="border border-border bg-white px-5 py-12 text-center text-sm text-ink-soft">
          Kayıtlı haberiniz yok. Haberlerin üzerindeki{" "}
          <strong className="text-ink">Kaydet</strong> düğmesiyle ekleyin.
        </p>
      ) : (
        <ul className="space-y-4">
          {rows.map(({ article, savedAt }) => (
            <li key={article.id} className="border border-border bg-white p-3 sm:p-4">
              <NewsCard article={article} variant="horizontal" />
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
                <p className="text-xs text-ink-soft">{formatDate(savedAt)} tarihinde kaydedildi</p>
                <BookmarkButton articleId={article.id} variant="text" />
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-center text-xs text-ink-soft">
        <Link href="/" className="font-semibold text-brand hover:underline">
          Haberlere dön
        </Link>
      </p>
    </>
  );
}
