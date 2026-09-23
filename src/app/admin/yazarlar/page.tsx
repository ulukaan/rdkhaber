import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Th, Td, EmptyRow } from "@/components/admin/Table";
import {
  PanelDesktopOnly,
  PanelMobileCard,
  PanelMobileCardBody,
  PanelMobileEmpty,
  PanelMobileList,
  PanelMobileOnly,
} from "@/components/admin/PanelMobileList";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { deleteUserAction } from "@/actions/user";
import { roleLabel } from "@/lib/role";

export const metadata = { title: "Yazarlar" };

export default async function AuthorsAdminPage() {
  const authors = await prisma.user.findMany({
    where: { role: { in: ["EDITOR", "ADMIN"] } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      slug: true,
      avatarUrl: true,
      _count: { select: { articles: { where: { status: "PUBLISHED" } } } },
      articles: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 1,
        select: { id: true, title: true, slug: true, publishedAt: true },
      },
    },
  });

  return (
    <>
      <PageHeader
        title="Yazarlar"
        description="Sitede Yazarlar bölümünde görünen editör profilleri. Her yazar için en son haber burada listelenir."
        action={
          <Button href="/admin/yazarlar/yeni" size="sm">
            <Plus className="h-4 w-4" /> Yeni Yazar
          </Button>
        }
      />

      <PanelMobileOnly>
        {authors.length === 0 ? (
          <PanelMobileEmpty>Henüz yazar yok. Yeni yazar ekleyin.</PanelMobileEmpty>
        ) : (
          <PanelMobileList>
            {authors.map((author) => {
              const latest = author.articles[0];
              return (
                <PanelMobileCard key={author.id}>
                  <PanelMobileCardBody
                    footer={
                      <div className="panel-row-actions flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/yazarlar/${author.id}`}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border text-ink-soft active:text-brand"
                          aria-label="Düzenle"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <DeleteButton id={author.id} action={deleteUserAction} />
                      </div>
                    }
                  >
                    <div className="flex gap-3">
                      {author.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={author.avatarUrl}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-bold text-ink-soft">
                          {author.name.slice(0, 1)}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-ink">{author.name}</p>
                        <p className="mt-0.5 break-all text-xs text-ink-soft">{author.email}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant={author.role === "ADMIN" ? "brand" : "outline"}>
                            {roleLabel(author.role)}
                          </Badge>
                          <Badge variant={author.active ? "brand" : "dark"}>
                            {author.active ? "Aktif" : "Pasif"}
                          </Badge>
                          <Badge variant="outline">{author._count.articles} haber</Badge>
                        </div>
                        {latest ? (
                          <p className="mt-2 line-clamp-2 text-xs text-ink-soft">
                            Son haber:{" "}
                            <Link href={`/haber/${latest.slug}`} className="font-semibold text-brand">
                              {latest.title}
                            </Link>
                          </p>
                        ) : (
                          <p className="mt-2 text-xs text-ink-soft">Henüz yayında haber yok.</p>
                        )}
                      </div>
                    </div>
                  </PanelMobileCardBody>
                </PanelMobileCard>
              );
            })}
          </PanelMobileList>
        )}
      </PanelMobileOnly>

      <PanelDesktopOnly>
        <Table>
          <thead>
            <tr>
              <Th>Yazar</Th>
              <Th>Rol</Th>
              <Th>Haber</Th>
              <Th>Son haber</Th>
              <Th>Durum</Th>
              <Th className="text-right">İşlemler</Th>
            </tr>
          </thead>
          <tbody>
            {authors.length === 0 && (
              <EmptyRow colSpan={6}>Henüz yazar yok. Yeni yazar ekleyin.</EmptyRow>
            )}
            {authors.map((author) => {
              const latest = author.articles[0];
              return (
                <tr key={author.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      {author.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={author.avatarUrl}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-bold text-ink-soft">
                          {author.name.slice(0, 1)}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-ink">{author.name}</p>
                        <p className="truncate text-xs text-ink-soft">{author.email}</p>
                        {author.slug ? (
                          <p className="text-xs text-ink-soft">/yazar/{author.slug}</p>
                        ) : null}
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Badge variant={author.role === "ADMIN" ? "brand" : "outline"}>
                      {roleLabel(author.role)}
                    </Badge>
                  </Td>
                  <Td className="tabular-nums text-ink-soft">{author._count.articles}</Td>
                  <Td className="max-w-[280px]">
                    {latest ? (
                      <Link
                        href={`/haber/${latest.slug}`}
                        className="line-clamp-2 text-sm font-medium text-brand hover:underline"
                      >
                        {latest.title}
                      </Link>
                    ) : (
                      <span className="text-sm text-ink-soft">—</span>
                    )}
                  </Td>
                  <Td>
                    <Badge variant={author.active ? "brand" : "dark"}>
                      {author.active ? "Aktif" : "Pasif"}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/yazarlar/${author.id}`}
                        className="text-ink-soft hover:text-brand"
                        aria-label="Düzenle"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteButton id={author.id} action={deleteUserAction} />
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </PanelDesktopOnly>
    </>
  );
}
