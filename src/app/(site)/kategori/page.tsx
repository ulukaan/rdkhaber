import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { categoryHref } from "@/lib/category-path";

export const metadata: Metadata = { title: "Kategoriler" };

export default async function CategoriesIndexPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <Container className="py-8">
      <SectionHeading title="Kategoriler" as="h1" />
      <p className="mb-6 -mt-2 text-sm text-ink-soft">
        Haberleri konuya göre inceleyin.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={categoryHref(c.slug)}
            className="border border-border bg-white p-4 transition hover:border-ink/25"
          >
            <span
              className="mb-3 block h-1 w-10"
              style={{ backgroundColor: c.color ?? "var(--brand)" }}
            />
            <h2 className="text-lg font-extrabold text-ink">{c.name}</h2>
            {c.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{c.description}</p>
            ) : null}
            <p className="mt-3 text-xs font-semibold text-ink-soft">
              {c._count.articles} haber
            </p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
