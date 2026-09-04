import type { Metadata } from "next";
import Link from "next/link";
import { User } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublicAuthors } from "@/lib/authors";
import { roleLabel } from "@/lib/role";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: "Yazarlar",
    description: `${settings.siteName} yazarları ve editörleri.`,
  };
}

export default async function AuthorsIndexPage() {
  const authors = await getPublicAuthors();

  return (
    <Container className="py-8">
      <SectionHeading title="Yazarlar" as="h1" />
      <p className="mb-6 max-w-2xl text-sm text-ink-soft">
        Editör ve yazarlarımızın profilleri ile yayınlanan haberleri.
      </p>

      {authors.length === 0 ? (
        <p className="text-sm text-ink-soft">Henüz listelenecek yazar yok.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((author) => (
            <li key={author.id}>
              <Link
                href={`/yazar/${author.slug}`}
                className="flex h-full gap-4 border border-border bg-white p-4 hover:border-brand"
              >
                {author.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={author.avatarUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface text-ink-soft">
                    <User className="h-7 w-7" aria-hidden />
                  </span>
                )}
                <div className="min-w-0">
                  <h2 className="text-base font-extrabold text-ink">{author.name}</h2>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    {roleLabel(author.role)}
                  </p>
                  {author.bio ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                      {author.bio}
                    </p>
                  ) : null}
                  {author.latestArticle ? (
                    <p className="mt-2 line-clamp-2 text-sm font-medium text-ink">
                      Son haber: {author.latestArticle.title}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-ink-soft">Henüz yayında haber yok.</p>
                  )}
                  <p className="mt-3 text-xs font-bold text-brand">
                    {author._count.articles > 0
                      ? `${author._count.articles} haber →`
                      : "Profili gör →"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
