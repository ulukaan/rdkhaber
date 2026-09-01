import { Eye, MessageSquare, Newspaper, Send, Users } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Table, Th, Td } from "@/components/admin/Table";
import {
  PanelDesktopOnly,
  PanelMobileCard,
  PanelMobileCardBody,
  PanelMobileList,
  PanelMobileOnly,
} from "@/components/admin/PanelMobileList";
import { loadStatsPageData } from "@/lib/stats-page-data";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "İstatistikler" };

export default async function StatsPage() {
  const {
    totalViews,
    publishedCount,
    commentCount,
    activeUsers,
    recentPublished,
    topArticles,
    submissions30,
    tips30,
  } = await loadStatsPageData();

  return (
    <>
      <PageHeader
        title="İstatistikler"
        description="Site trafiği, içerik ve okuyucu katkılarının özeti."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Toplam görüntülenme" value={totalViews} Icon={Eye} />
        <StatCard label="Yayında haber" value={publishedCount} Icon={Newspaper} />
        <StatCard label="Onaylı yorum" value={commentCount} Icon={MessageSquare} />
        <StatCard label="Aktif üye" value={activeUsers} Icon={Users} />
        <StatCard label="Son 30 gün yayın" value={recentPublished} Icon={Newspaper} />
        <StatCard label="30 gün başvuru" value={submissions30} Icon={Send} />
        <StatCard label="30 gün ihbar" value={tips30} Icon={Send} />
      </div>

      <div className="mt-8 rounded-xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-4 py-3.5 sm:px-5">
          <h3 className="text-sm font-bold text-ink">En çok okunan haberler</h3>
        </div>
        <PanelMobileOnly>
          <PanelMobileList>
            {topArticles.map((a) => (
              <PanelMobileCard key={a.slug}>
                <PanelMobileCardBody>
                  <p className="line-clamp-2 text-sm font-bold text-ink">{a.title}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
                    <span>{a.viewCount.toLocaleString("tr-TR")} görüntülenme</span>
                    <span>{a.publishedAt ? formatDate(a.publishedAt) : "—"}</span>
                  </div>
                </PanelMobileCardBody>
              </PanelMobileCard>
            ))}
          </PanelMobileList>
        </PanelMobileOnly>
        <PanelDesktopOnly>
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
        </PanelDesktopOnly>
      </div>
    </>
  );
}
