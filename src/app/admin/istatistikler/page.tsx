import { Eye, MessageSquare, Newspaper, Send, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Table, Th, Td } from "@/components/admin/Table";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "İstatistikler" };

export default async function StatsPage() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60_000);

  const [
    totalViews,
    publishedCount,
    commentCount,
    activeUsers,
    recentPublished,
    topArticles,
    submissions30,
    tips30,
  ] = await Promise.all([
    prisma.article.aggregate({ _sum: { viewCount: true } }),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.comment.count({ where: { approved: true } }),
    prisma.user.count({ where: { active: true } }),
    prisma.article.count({
      where: { status: "PUBLISHED", publishedAt: { gte: thirtyDaysAgo } },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { viewCount: "desc" },
      take: 10,
      select: { title: true, slug: true, viewCount: true, publishedAt: true },
    }),
    prisma.newsSubmission.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.tip.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
  ]);

  return (
    <>
      <PageHeader
        title="İstatistikler"
        description="Site trafiği, içerik ve okuyucu katkılarının özeti."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <StatCard
          label="Toplam görüntülenme"
          value={totalViews._sum.viewCount ?? 0}
          Icon={Eye}
        />
        <StatCard label="Yayında haber" value={publishedCount} Icon={Newspaper} />
        <StatCard label="Onaylı yorum" value={commentCount} Icon={MessageSquare} />
        <StatCard label="Aktif üye" value={activeUsers} Icon={Users} />
        <StatCard label="Son 30 gün yayın" value={recentPublished} Icon={Newspaper} />
        <StatCard label="30 gün başvuru" value={submissions30} Icon={Send} />
        <StatCard label="30 gün ihbar" value={tips30} Icon={Send} />
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-3.5">
          <h3 className="text-sm font-bold text-ink">En çok okunan haberler</h3>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Başlık</Th>
              <Th>Görüntülenme</Th>
              <Th>Yayın</Th>
            </tr>
          </thead>
          <tbody>
            {topArticles.map((a) => (
              <tr key={a.slug}>
                <Td className="max-w-md font-semibold text-ink">{a.title}</Td>
                <Td>{a.viewCount.toLocaleString("tr-TR")}</Td>
                <Td className="text-xs text-ink-soft">
                  {a.publishedAt ? formatDate(a.publishedAt) : "—"}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}
