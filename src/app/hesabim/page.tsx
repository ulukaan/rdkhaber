import Link from "next/link";
import { Bookmark, BookOpen, Mail, MessageSquare, Newspaper, Send, UserPlus, UserRound } from "lucide-react";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { getLibraryCounts, getBookmarkedArticles, getReadArticles, getFollowedAuthors } from "@/lib/library";
import { NewsCard } from "@/components/news/NewsCard";

export const metadata = { title: "Hesabım" };

const statusLabel = {
  PENDING: { text: "İnceleniyor", variant: "outline" as const },
  APPROVED: { text: "Onaylandı", variant: "brand" as const },
  REJECTED: { text: "Reddedildi", variant: "dark" as const },
};

export default async function AccountDashboardPage() {
  const session = await requireAuth();
  const email = session.user.email ?? "";

  const [counts, newsletter, recentSubs, saved, reads, following] = await Promise.all([
    getLibraryCounts(session.user.id),
    email
      ? prisma.newsletterSubscriber.findUnique({
          where: { email },
          select: { status: true },
        })
      : Promise.resolve(null),
    prisma.newsSubmission.findMany({
      where: { submitterId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, title: true, status: true, createdAt: true },
    }),
    getBookmarkedArticles(session.user.id, 3),
    getReadArticles(session.user.id, 3),
    getFollowedAuthors(session.user.id),
  ]);

  const subscribed = newsletter?.status === "ACTIVE";

  return (
    <>
      <PageHeader
        title={`Merhaba, ${session.user.name?.split(" ")[0] ?? "üyemiz"}`}
        description="Kaydettiğiniz haberler, okuma geçmişiniz ve takip ettiğiniz yazarlar burada."
        action={
          <Button href="/hesabim/haber-gonder">
            <Send className="h-4 w-4" />
            Haber gönder
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Kaydettiklerim" value={counts.bookmarks} Icon={Bookmark} href="/hesabim/kaydettiklerim" />
        <StatCard label="Okuduklarım" value={counts.reads} Icon={BookOpen} href="/hesabim/okuduklarim" />
        <StatCard label="Takip" value={counts.following} Icon={UserPlus} href="/hesabim/takip" />
        <StatCard label="Yorumlarım" value={counts.comments} Icon={MessageSquare} href="/hesabim/yorumlarim" />
        <StatCard label="Haberlerim" value={counts.submissions} Icon={Newspaper} href="/hesabim/haberlerim" />
        <StatCard
          label="Bülten"
          value={subscribed ? "Açık" : "Kapalı"}
          Icon={Mail}
          href="/hesabim/bulten"
          highlight={subscribed}
        />
        <StatCard label="Profil" value="Düzenle" Icon={UserRound} href="/hesabim/profil" />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-ink">Son kaydettikleriniz</h3>
          <Link href="/hesabim/kaydettiklerim" className="text-xs font-semibold text-ink-soft hover:text-brand">
            Tümü →
          </Link>
        </div>
        {saved.length === 0 ? (
          <p className="border border-border bg-white px-4 py-8 text-center text-sm text-ink-soft">
            Henüz haber kaydetmediniz. Haber sayfasındaki{" "}
            <strong className="text-ink">Kaydet</strong> ile buraya ekleyin.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {saved.map(({ article }) => (
              <NewsCard key={article.id} article={article} variant="vertical" />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-ink">Son okuduklarınız</h3>
          <Link href="/hesabim/okuduklarim" className="text-xs font-semibold text-ink-soft hover:text-brand">
            Tümü →
          </Link>
        </div>
        {reads.length === 0 ? (
          <p className="border border-border bg-white px-4 py-8 text-center text-sm text-ink-soft">
            Giriş yaptıktan sonra okuduğunuz haberler burada listelenir.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {reads.map(({ article }) => (
              <NewsCard key={article.id} article={article} variant="vertical" />
            ))}
          </div>
        )}
      </section>

      {following.length > 0 ? (
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-ink">Takip ettiğiniz yazarlar</h3>
            <Link href="/hesabim/takip" className="text-xs font-semibold text-ink-soft hover:text-brand">
              Tümü →
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {following.slice(0, 4).map(({ author }) => (
              <li key={author.id}>
                <Link
                  href={author.slug ? `/yazar/${author.slug}` : "/yazarlar"}
                  className="flex items-center gap-3 border border-border bg-white p-3 hover:border-brand"
                >
                  {author.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={author.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-xs font-bold">
                      {author.name.slice(0, 1)}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-extrabold text-ink">{author.name}</span>
                    <span className="text-xs text-ink-soft">{author._count.articles} haber</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-8 overflow-hidden border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h3 className="text-sm font-bold text-ink">Son gönderiler</h3>
          <Link href="/hesabim/haberlerim" className="text-xs font-semibold text-ink-soft hover:text-brand">
            Tümünü gör →
          </Link>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {recentSubs.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-soft">
              Henüz haber göndermediniz.{" "}
              <Link href="/hesabim/haber-gonder" className="font-semibold text-brand hover:underline">
                İlk haberinizi iletin
              </Link>
            </p>
          ) : (
            recentSubs.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <span className="min-w-0 truncate font-semibold text-ink">{item.title}</span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-xs text-ink-soft sm:inline">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                  <Badge variant={statusLabel[item.status].variant}>
                    {statusLabel[item.status].text}
                  </Badge>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
