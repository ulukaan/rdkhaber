import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { User } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NewsCard } from "@/components/news/NewsCard";
import {
  countAuthorArticles,
  ensureUserSlug,
  getAuthorArticles,
  getAuthorBySlug,
} from "@/lib/authors";
import { roleLabel } from "@/lib/role";
import { getSettings } from "@/lib/settings";

const PAGE_SIZE = 18;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return { title: "Yazar Bulunamadı" };
  const settings = await getSettings();
  return {
    title: author.name,
    description: author.bio?.trim() || `${author.name} — ${settings.siteName} yazarı.`,
  };
}

export default async function AuthorProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sayfa?: string }>;
}) {
  const { slug } = await params;
  const { sayfa } = await searchParams;
  let author = await getAuthorBySlug(slug);

  // Eski kayıtlarda slug yoksa: id ile bulup slug üret (nadir)
  if (!author) {
    const { prisma } = await import("@/lib/prisma");
    const byId = await prisma.user.findFirst({
      where: { id: slug, active: true, role: { in: ["ADMIN", "EDITOR"] } },
      select: { id: true, name: true, slug: true },
    });
    if (byId) {
      const ensured = await ensureUserSlug(byId.id, byId.name, byId.slug);
      author = await getAuthorBySlug(ensured);
    }
  }

  if (!author) notFound();

  const page = Math.max(1, Number(sayfa) || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const [articles, total] = await Promise.all([
    getAuthorArticles(author.id, PAGE_SIZE, skip),
    countAuthorArticles(author.id),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Container className="py-8">
      <header className="mb-8 border border-border bg-white p-5 md:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {author.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={author.avatarUrl}
              alt=""
              className="h-24 w-24 shrink-0 rounded-full object-cover md:h-28 md:w-28"
            />
          ) : (
            <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-surface text-ink-soft md:h-28 md:w-28">
              <User className="h-10 w-10" aria-hidden />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
              {roleLabel(author.role)}
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-ink md:text-3xl">
              {author.name}
            </h1>
            {author.bio ? (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft md:text-[15px]">
                {author.bio}
              </p>
            ) : (
              <p className="mt-3 text-sm text-ink-soft">
                {total} yayında haber.
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold">
              <span className="rounded-sm bg-surface px-2.5 py-1 text-ink">
                {total} haber
              </span>
              <Link href="/yazarlar" className="text-brand hover:underline">
                Tüm yazarlar
              </Link>
            </div>
          </div>
        </div>
      </header>

      <SectionHeading title="Haberleri" as="h2" />

      {articles.length === 0 ? (
        <p className="text-sm text-ink-soft">Bu yazara ait yayında haber yok.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} variant="vertical" />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Sayfalar">
          {page > 1 ? (
            <Link
              href={page === 2 ? `/yazar/${author.slug}` : `/yazar/${author.slug}?sayfa=${page - 1}`}
              className="border border-border px-3 py-1.5 text-sm font-semibold hover:border-brand"
            >
              Önceki
            </Link>
          ) : null}
          <span className="px-2 text-sm text-ink-soft">
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/yazar/${author.slug}?sayfa=${page + 1}`}
              className="border border-border px-3 py-1.5 text-sm font-semibold hover:border-brand"
            >
              Sonraki
            </Link>
          ) : null}
        </nav>
      ) : null}
    </Container>
  );
}
