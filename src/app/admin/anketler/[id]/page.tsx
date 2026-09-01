import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { PollForm } from "@/components/admin/PollForm";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Anket Düzenle" };

export default async function EditPollPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [poll, articles] = await Promise.all([
    prisma.poll.findUnique({
      where: { id },
      include: { options: { orderBy: { order: "asc" } }, article: { select: { slug: true } } },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 80,
      select: { slug: true, title: true },
    }),
  ]);

  if (!poll) notFound();

  return (
    <>
      <PageHeader title="Anket Düzenle" />
      <PollForm
        articles={articles}
        defaults={{
          id: poll.id,
          question: poll.question,
          description: poll.description ?? "",
          coverImageUrl: poll.coverImageUrl ?? "",
          articleSlug: poll.article?.slug ?? "",
          active: poll.active,
          showResults: poll.showResults,
          endsAt: poll.endsAt?.toISOString(),
          options: poll.options.map((option) => ({
            label: option.label,
            imageUrl: option.imageUrl ?? "",
          })),
        }}
      />
    </>
  );
}
