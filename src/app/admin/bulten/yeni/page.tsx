import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { NewsletterNav } from "@/components/admin/NewsletterNav";
import { NewsletterCampaignForm } from "@/components/admin/NewsletterCampaignForm";

export const metadata = { title: "Yeni bülten" };

async function getArticleOptions() {
  return prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 60,
    select: { id: true, title: true },
  });
}

export default async function NewNewsletterPage() {
  const articles = await getArticleOptions();

  return (
    <>
      <PageHeader
        title="Yeni bülten"
        description="Haber seçerek doldurun, metni düzenleyin ve abonelere gönderin."
      />
      <NewsletterNav pathname="/admin/bulten/yeni" />
      <NewsletterCampaignForm articles={articles} />
    </>
  );
}
