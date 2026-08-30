import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { NewsletterNav } from "@/components/admin/NewsletterNav";
import { NewsletterCampaignForm } from "@/components/admin/NewsletterCampaignForm";
import { NewsletterSendBar } from "@/components/admin/NewsletterSendBar";
import { sanitizeNewsletterHtml } from "@/lib/newsletter";

export const maxDuration = 300;

export const metadata = { title: "Bülteni gönder" };

export default async function NewsletterCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [campaign, subscriberCount, articles] = await Promise.all([
    prisma.newsletterCampaign.findUnique({ where: { id } }),
    prisma.newsletterSubscriber.count({ where: { status: "ACTIVE" } }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 60,
      select: { id: true, title: true },
    }),
  ]);
  if (!campaign) notFound();

  return (
    <>
      <PageHeader title={campaign.subject} description="Önce test gönderin, sonra abonelere yayınlayın." />
      <NewsletterNav pathname="/admin/bulten" />
      <div className="mb-6">
        <NewsletterSendBar
          campaignId={campaign.id}
          subscriberCount={subscriberCount}
          sent={campaign.status === "SENT"}
        />
        {campaign.lastError ? (
          <p className="mt-2 text-sm font-medium text-brand">{campaign.lastError}</p>
        ) : null}
      </div>
      {campaign.status === "SENT" ? (
        <article
          className="prose max-w-3xl rounded-xl border border-border bg-white p-6 text-ink"
          dangerouslySetInnerHTML={{ __html: sanitizeNewsletterHtml(campaign.content) }}
        />
      ) : (
        <NewsletterCampaignForm
          articles={articles}
          defaults={{
            id: campaign.id,
            subject: campaign.subject,
            preheader: campaign.preheader,
            content: campaign.content,
          }}
        />
      )}
    </>
  );
}
