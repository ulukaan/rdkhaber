import Link from "next/link";
import { Newspaper, FileEdit, Users, Megaphone, Send, FolderTree, MessageSquare, Mail } from "lucide-react";
import type { ArticleStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { formatRelativeTime } from "@/lib/utils";

export async function DashboardPage({ role }: { role: Role }) {
  const basePath = role === "ADMIN" ? "/admin" : "/editor";

  const [published, draft, pendingTips, pendingSubmissions, pendingComments, userCount, categoryCount, subscriberCount, recent] =
    await Promise.all([
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.article.count({ where: { status: "DRAFT" } }),
      prisma.tip.count({ where: { status: "PENDING" } }),
      prisma.newsSubmission.count({ where: { status: "PENDING" } }),
      prisma.comment.count({ where: { approved: false } }),
      role === "ADMIN" ? prisma.user.count() : Promise.resolve(null),
      role === "ADMIN" ? prisma.category.count() : Promise.resolve(null),
      role === "ADMIN"
        ? prisma.newsletterSubscriber.count({ where: { status: "ACTIVE" } })
        : Promise.resolve(null),
      prisma.article.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, title: true, status: true, createdAt: true, author: { select: { name: true } } },
      }),
    ]);

  return (
    <>
      <PageHeader
        title={role === "ADMIN" ? "Genel Bakış" : "Editör Panosu"}
        description="Site içeriğinin özeti."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Yayında" value={published} Icon={Newspaper} href={`${basePath}/makaleler`} />
        <StatCard label="Taslak" value={draft} Icon={FileEdit} href={`${basePath}/makaleler`} />
        <StatCard
          label="Bekleyen İhbar"
          value={pendingTips}
          Icon={Megaphone}
          href={`${basePath}/ihbarlar`}
          highlight
        />
        <StatCard
          label="Okuyucu Haberi"
          value={pendingSubmissions}
          Icon={Send}
          href={`${basePath}/haber-basvurulari`}
          highlight
        />
        <StatCard
          label="Bekleyen Yorum"
          value={pendingComments}
          Icon={MessageSquare}
          href={`${basePath}/yorumlar`}
          highlight
        />
        {role === "ADMIN" && (
          <>
            <StatCard label="Kullanıcı" value={userCount ?? 0} Icon={Users} href="/admin/kullanicilar" />
            <StatCard
              label="Kategori"
              value={categoryCount ?? 0}
              Icon={FolderTree}
              href="/admin/kategoriler"
            />
            <StatCard
              label="Bülten abonesi"
              value={subscriberCount ?? 0}
              Icon={Mail}
              href="/admin/bulten"
            />
          </>
        )}
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
            <span className="h-4 w-1 rounded-full bg-brand" aria-hidden />
            Son Eklenen Haberler
          </h3>
          <Link
            href={`${basePath}/makaleler`}
            className="text-xs font-semibold text-ink-soft transition-colors hover:text-brand"
          >
            Tümünü gör →
          </Link>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {recent.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-ink-soft">Henüz haber yok.</p>
          )}
          {recent.map((a) => (
            <Link
              key={a.id}
              href={`${basePath}/makaleler/${a.id}`}
              className="flex items-center justify-between gap-4 px-5 py-3 text-sm transition-colors hover:bg-surface/60"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <StatusDot status={a.status} />
                <span className="truncate font-semibold text-ink">{a.title}</span>
              </span>
              <span className="shrink-0 text-xs text-ink-soft">
                {a.author.name} · {formatRelativeTime(a.createdAt)}
              </span>
            </Link>
          ))}
        </div>
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
