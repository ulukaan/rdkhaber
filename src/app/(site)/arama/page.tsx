import { searchArticles, countSearchArticles } from "@/lib/articles";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NewsCard } from "@/components/news/NewsCard";
import Link from "next/link";

export const metadata = { title: "Arama Sonuçları" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageRaw } = await searchParams;
  const query = (q ?? "").trim();
  const page = Math.max(1, Number(pageRaw ?? "1") || 1);
  const take = 20;
  const skip = (page - 1) * take;

  const [results, total] = query
    ? await Promise.all([searchArticles(query, take, skip), countSearchArticles(query)])
    : [[], 0];

  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <Container className="py-6">
      <SectionHeading title={query ? `"${query}" için sonuçlar` : "Arama"} />
      {query ? (
        <p className="mb-4 text-sm text-ink-soft">
          {total} sonuç bulundu · sayfa {page}/{totalPages}
        </p>
      ) : null}

      {!query && <p className="text-ink-soft">Aramak için üstteki kutuyu kullanın.</p>}

      {query && results.length === 0 && (
        <p className="text-ink-soft">Sonuç bulunamadı.</p>
      )}

      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {results.map((a) => (
          <NewsCard key={a.id} article={a} variant="vertical" />
        ))}
      </div>

      {query && totalPages > 1 ? (
        <div className="mt-8 flex flex-wrap gap-2">
          {Array.from({ length: totalPages }).map((_, index) => {
            const p = index + 1;
            const href = `/arama?q=${encodeURIComponent(query)}&page=${p}`;
            return (
              <Link
                key={p}
                href={href}
                className={`min-h-11 min-w-11 inline-flex items-center justify-center border px-3 text-sm font-semibold ${
                  p === page ? "border-brand bg-brand text-white" : "border-border text-ink hover:border-brand"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      ) : null}
    </Container>
  );
}
