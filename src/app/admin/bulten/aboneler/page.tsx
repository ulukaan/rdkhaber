import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { NewsletterNav } from "@/components/admin/NewsletterNav";
import { NewsletterSubscriberForms } from "@/components/admin/NewsletterSubscriberForms";
import { NewsletterSubscriberTable } from "@/components/admin/NewsletterSubscriberTable";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Bülten aboneleri" };

export const maxDuration = 300;

export default async function NewsletterSubscribersPage() {
  const [subscribers, articles] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 60,
      select: { id: true, title: true, publishedAt: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Aboneler"
        description="Abone ekleyin, haber seçerek gönderin veya seçili abonelere iletin."
        action={
          subscribers.length > 0 ? (
            <Button href="/admin/bulten/aboneler/export" size="sm" variant="outline">
              CSV indir
            </Button>
          ) : undefined
        }
      />
      <NewsletterNav pathname="/admin/bulten/aboneler" />
      <NewsletterSubscriberForms />
      <NewsletterSubscriberTable
        subscribers={subscribers.map((s) => ({
          ...s,
          createdAt: s.createdAt.toISOString(),
        }))}
        articles={articles.map((a) => ({
          ...a,
          publishedAt: a.publishedAt?.toISOString() ?? null,
        }))}
      />
    </>
  );
}
