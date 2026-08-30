import { searchArticles } from "@/lib/articles";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NewsCard } from "@/components/news/NewsCard";

export const metadata = { title: "Arama Sonuçları" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? await searchArticles(query) : [];

  return (
    <Container className="py-6">
      <SectionHeading title={query ? `"${query}" için sonuçlar` : "Arama"} />

      {!query && <p className="text-ink-soft">Aramak için üstteki kutuyu kullanın.</p>}

      {query && results.length === 0 && (
        <p className="text-ink-soft">Sonuç bulunamadı.</p>
      )}

      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {results.map((a) => (
          <NewsCard key={a.id} article={a} variant="vertical" />
        ))}
      </div>
    </Container>
  );
}
