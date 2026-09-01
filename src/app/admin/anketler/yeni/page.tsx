import { PageHeader } from "@/components/admin/PageHeader";
import { PollForm } from "@/components/admin/PollForm";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Yeni Anket" };

export default async function NewPollPage() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 80,
    select: { slug: true, title: true },
  });

  return (
    <>
      <PageHeader title="Yeni Anket" />
      <PollForm articles={articles} />
    </>
  );
}
