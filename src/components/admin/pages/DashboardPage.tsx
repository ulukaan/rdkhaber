import Link from "next/link";
import {
  BarChart3,
  Bot,
  ClipboardCheck,
  Eye,
  FileEdit,
  FolderTree,
  ImageIcon,
  Images,
  Mail,
  Megaphone,
  MessageSquare,
  Newspaper,
  Send,
  Users,
  Zap,
  BadgeDollarSign,
} from "lucide-react";
import type { ArticleStatus, Role } from "@prisma/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { DashboardGoogleStatus } from "@/components/admin/DashboardGoogleStatus";
import { PanelCard, SectionHeader } from "@/components/admin/PanelUI";
import { loadDashboardData } from "@/lib/dashboard-data";
import { formatDate, formatRelativeTime } from "@/lib/utils";

export async function DashboardPage({ role }: { role: Role }) {
  const basePath = role === "ADMIN" ? "/admin" : "/editor";
  const data = await loadDashboardData(role);

  const description =
    data.pendingTotal > 0
      ? `${data.pendingTotal.toLocaleString("tr-TR")} bekleyen iş · ${data.publishedToday} haber bugün yayınlandı`
      : `${data.published.toLocaleString("tr-TR")} yayında haber · ${data.totalViews.toLocaleString("tr-TR")} toplam görüntülenme`;

  return (
    <>
      <PageHeader
        title={role === "ADMIN" ? "Genel Bakış" : "Editör Panosu"}
        description={description}
        action={
          role === "ADMIN" ? (
            <Link
              href="/admin/istatistikler"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              <BarChart3 className="h-4 w-4" />
              Detaylı istatistikler
            </Link>
          ) : null
        }
      />

      {data.pendingTotal > 0 ? (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="font-bold">{data.pendingTotal.toLocaleString("tr-TR")} bekleyen iş</span>
          {" — "}
          {[
            data.review > 0 ? `${data.review} onay` : null,
            data.pendingComments > 0 ? `${data.pendingComments} yorum` : null,
            data.pendingSubmissions > 0 ? `${data.pendingSubmissions} okuyucu haberi` : null,
            data.pendingTips > 0 ? `${data.pendingTips} ihbar` : null,
          ]
            .filter(Boolean)
            .join(", ")}
          .
        </div>
      ) : null}

      <SectionHeader title="İçerik özeti" className="mb-3" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard
          label="Toplam görüntülenme"
          value={data.totalViews}
          Icon={Eye}
          href={role === "ADMIN" ? "/admin/istatistikler" : undefined}
          subtext="Tüm yayınlar"
        />
        <StatCard
          label="Yayında"
          value={data.published}
          Icon={Newspaper}
          href={`${basePath}/makaleler`}
          subtext={`${data.published30d} son 30 gün`}
        />
        <StatCard
          label="Bugün yayın"
          value={data.publishedToday}
          Icon={Zap}
          href={`${basePath}/makaleler`}
          subtext={`${data.published7d} son 7 gün`}
        />
        <StatCard label="Taslak" value={data.draft} Icon={FileEdit} href={`${basePath}/makaleler`} />
        <StatCard
          label="Onay bekleyen"
          value={data.review}
          Icon={ClipboardCheck}
          href={`${basePath}/onay-kuyrugu`}
          highlight
        />
        <StatCard
          label="Son dakika"
          value={data.breakingCount}
          Icon={Zap}
          href={`${basePath}/son-dakika`}
          subtext="Üst manşet"
        />
      </div>

      <SectionHeader title="Okuyucu ve moderasyon" className="mb-3 mt-6" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        <StatCard
          label="Bekleyen ihbar"
          value={data.pendingTips}
          Icon={Megaphone}
          href={`${basePath}/ihbarlar`}
          highlight
        />
        <StatCard
          label="Okuyucu haberi"
          value={data.pendingSubmissions}
          Icon={Send}
          href={`${basePath}/haber-basvurulari`}
          highlight
        />
        <StatCard
          label="Bekleyen yorum"
          value={data.pendingComments}
          Icon={MessageSquare}
          href={`${basePath}/yorumlar`}
          highlight
        />
        <StatCard
          label="Onaylı yorum"
          value={data.commentCount}
          Icon={MessageSquare}
          href={`${basePath}/yorumlar`}
        />
      </div>

      {role === "ADMIN" ? (
        <>
          <SectionHeader title="Site ve altyapı" className="mb-3 mt-6" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            <StatCard label="Kullanıcı" value={data.userCount ?? 0} Icon={Users} href="/admin/kullanicilar" />
            <StatCard label="Kategori" value={data.categoryCount ?? 0} Icon={FolderTree} href="/admin/kategoriler" />
            <StatCard
              label="Bülten abonesi"
              value={data.subscriberCount ?? 0}
              Icon={Mail}
              href="/admin/bulten"
            />
            <StatCard
              label="Medya"
              value={data.mediaCount ?? 0}
              Icon={ImageIcon}
              href="/admin/medya"
              subtext={data.mediaSizeMb ? `${data.mediaSizeMb.toFixed(1)} MB` : undefined}
            />
            <StatCard label="Galeri" value={data.galleryCount ?? 0} Icon={Images} href="/admin/galeriler" />
            <StatCard
              label="Aktif reklam"
              value={data.activeAdCount ?? 0}
              Icon={BadgeDollarSign}
              href="/admin/reklamlar"
            />
            <StatCard
              label="Haber botu"
              value={data.haberBotSourceCount ?? 0}
              Icon={Bot}
              href="/admin/haber-botu"
              subtext="Aktif kaynak"
            />
          </div>

          {data.google ? <DashboardGoogleStatus google={data.google} /> : null}
        </>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <PanelCard padding={false}>
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <SectionHeader title="En çok okunanlar" className="mb-0" />
            {role === "ADMIN" ? (
              <Link
                href="/admin/istatistikler"
                className="text-xs font-semibold text-ink-soft transition-colors hover:text-brand"
              >
                Tümü →
              </Link>
            ) : null}
          </div>
          <div className="flex flex-col divide-y divide-border">
            {data.topArticles.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-ink-soft">Henüz veri yok.</p>
            ) : (
              data.topArticles.map((a, i) => (
                <Link
                  key={a.slug}
                  href={`/haber/${a.slug}`}
                  target="_blank"
                  className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-surface/60"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-xs font-extrabold text-brand">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 font-semibold text-ink">{a.title}</span>
                    <span className="mt-0.5 block text-[11px] text-ink-soft">
                      {a.viewCount.toLocaleString("tr-TR")} görüntülenme
                      {a.publishedAt ? ` · ${formatDate(a.publishedAt)}` : ""}
                    </span>
                  </span>
                </Link>
              ))
            )}
          </div>
        </PanelCard>

        <PanelCard padding={false}>
          <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5">
            <SectionHeader title="Son eklenen haberler" className="mb-0" />
            <Link
              href={`${basePath}/makaleler`}
              className="text-xs font-semibold text-ink-soft transition-colors hover:text-brand"
            >
              Tümü →
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {data.recent.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-ink-soft sm:px-5">Henüz haber yok.</p>
            ) : (
              data.recent.map((a) => (
                <Link
                  key={a.id}
                  href={`${basePath}/makaleler/${a.id}`}
                  className="flex flex-col gap-1 px-4 py-3 text-sm transition-colors hover:bg-surface/60 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <StatusDot status={a.status as ArticleStatus} />
                    <span className="line-clamp-2 font-semibold text-ink sm:truncate">{a.title}</span>
                  </span>
                  <span className="shrink-0 pl-5 text-xs text-ink-soft sm:pl-0">
                    {a.author.name} · {formatRelativeTime(a.createdAt)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </PanelCard>
      </div>
    </>
  );
}

const STATUS_DOT: Record<ArticleStatus, { color: string; label: string }> = {
  PUBLISHED: { color: "bg-emerald-500", label: "Yayında" },
  DRAFT: { color: "bg-amber-500", label: "Taslak" },
  REVIEW: { color: "bg-sky-500", label: "İncelemede" },
  ARCHIVED: { color: "bg-gray-400", label: "Arşiv" },
};

function StatusDot({ status }: { status: ArticleStatus }) {
  const s = STATUS_DOT[status];
  return (
    <span
      className={`h-2 w-2 shrink-0 rounded-full ${s.color}`}
      title={s.label}
      aria-label={s.label}
    />
  );
}
