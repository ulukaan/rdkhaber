import Link from "next/link";
import { requireAuth } from "@/lib/auth-guard";
import { PageHeader } from "@/components/admin/PageHeader";
import { NewsCard } from "@/components/news/NewsCard";
import { getReadArticles } from "@/lib/library";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Okuduklarım" };

export default async function ReadArticlesPage() {
  const session = await requireAuth();
  const rows = await getReadArticles(session.user.id, 60);

  return (
    <>
      <PageHeader
        title="Okuduklarım"
        description="Giriş yaptıktan sonra açtığınız haberler. En son okunan üstte."
      />
      {rows.length === 0 ? (
        <p className="border border-border bg-white px-5 py-12 text-center text-sm text-ink-soft">
          Henüz kayıtlı okuma yok. Haber okudukça burası dolar.
        </p>
      ) : (
        <ul className="space-y-4">
          {rows.map(({ article, readAt }) => (
            <li key={article.id} className="border border-border bg-white p-3 sm:p-4">
              <NewsCard article={article} variant="horizontal" />
              <p className="mt-3 border-t border-border pt-3 text-xs text-ink-soft">
                Son okuma: {formatDate(readAt)}
              </p>
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
