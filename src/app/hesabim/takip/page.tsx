import Link from "next/link";
import { User } from "lucide-react";
import { requireAuth } from "@/lib/auth-guard";
import { PageHeader } from "@/components/admin/PageHeader";
import { FollowAuthorButton } from "@/components/account/FollowAuthorButton";
import { getFollowedAuthors } from "@/lib/library";
import { roleLabel } from "@/lib/role";

export const metadata = { title: "Takip ettiklerim" };

export default async function FollowedAuthorsPage() {
  const session = await requireAuth();
  const rows = await getFollowedAuthors(session.user.id);

  return (
    <>
      <PageHeader
        title="Takip ettiklerim"
        description="Takip ettiğiniz yazarlar. Yeni haberleri yazar sayfasından takip edebilirsiniz."
      />
      {rows.length === 0 ? (
        <p className="border border-border bg-white px-5 py-12 text-center text-sm text-ink-soft">
          Henüz yazar takip etmiyorsunuz.{" "}
          <Link href="/yazarlar" className="font-semibold text-brand hover:underline">
            Yazarlar
          </Link>{" "}
          sayfasından bir yazara girip takip edin.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3">
          {rows.map(({ author }) => (
            <li key={author.id} className="flex items-start gap-4 border border-border bg-white p-4">
              <Link href={author.slug ? `/yazar/${author.slug}` : "/yazarlar"} className="shrink-0">
                {author.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={author.avatarUrl}
                    alt=""
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-ink-soft">
                    <User className="h-6 w-6" aria-hidden />
                  </span>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={author.slug ? `/yazar/${author.slug}` : "/yazarlar"}
                  className="text-base font-extrabold text-ink hover:text-brand"
                >
                  {author.name}
                </Link>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  {roleLabel(author.role)} · {author._count.articles} haber
                </p>
                {author.bio ? (
                  <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{author.bio}</p>
                ) : null}
              </div>
              <FollowAuthorButton authorId={author.id} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
