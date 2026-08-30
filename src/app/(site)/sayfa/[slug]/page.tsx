import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { KunyeLayout, LegalDocumentLayout } from "@/components/pages/StaticDocument";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || !page.published) return { title: "Sayfa bulunamadı" };
  return { title: page.title };
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [page, settings] = await Promise.all([
    prisma.page.findUnique({ where: { slug } }),
    getSettings(),
  ]);
  if (!page || !page.published) notFound();

  if (slug === "kunye") {
    return (
      <KunyeLayout
        title={page.title}
        content={page.content}
        settings={{
          siteName: settings.siteName,
          siteSlogan: settings.siteSlogan,
          contactEmail: settings.contactEmail,
          contactPhone: settings.contactPhone,
          contactAddress: settings.contactAddress,
          tipLinePhone: settings.tipLinePhone,
          tipLineEmail: settings.tipLineEmail,
          whatsappNumber: settings.whatsappNumber,
        }}
      />
    );
  }

  return <LegalDocumentLayout slug={slug} title={page.title} content={page.content} />;
}
