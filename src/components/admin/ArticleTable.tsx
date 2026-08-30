import Link from "next/link";
import { Pencil, Eye, LayoutTemplate } from "lucide-react";
import { Table, Th, Td, EmptyRow } from "@/components/admin/Table";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ArticleCategorySelect } from "@/components/admin/ArticleCategorySelect";
import { deleteArticleAction } from "@/actions/article";
import { formatDate } from "@/lib/utils";
import { CoverImage } from "@/components/news/CoverImage";
import { ShareButtons } from "@/components/news/ShareButtons";
import { getSiteUrl } from "@/lib/site-url";

type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: Date | string | null;
  createdAt: Date | string;
  viewCount: number;
  coverImageUrl?: string | null;
  categoryId: string;
  category: { name: string };
  author: { name: string };
};

type CategoryOption = { id: string; name: string };

const STATUS_LABEL: Record<string, { text: string; variant: "brand" | "outline" | "dark" }> = {
  DRAFT: { text: "Taslak", variant: "outline" },
  REVIEW: { text: "İncelemede", variant: "dark" },
  PUBLISHED: { text: "Yayında", variant: "brand" },
  ARCHIVED: { text: "Arşiv", variant: "outline" },
};

export function ArticleTable({
  articles,
  categories,
  basePath,
  designBasePath,
}: {
  articles: ArticleRow[];
  categories: CategoryOption[];
  basePath: string;
  designBasePath?: string;
}) {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const colSpan = designBasePath ? 8 : 7;

  if (articles.length === 0) {
    return (
      <>
        <div className="md:hidden">
          <ArticleMobileList articles={[]} basePath={basePath} designBasePath={designBasePath} siteUrl={siteUrl} categories={categories} />
        </div>
        <div className="hidden md:block">
          <Table>
            <thead>
              <tr>
                {designBasePath && <Th>Görsel</Th>}
                <Th>Başlık</Th>
                <Th>Kategori</Th>
                <Th>Yazar</Th>
                <Th>Durum</Th>
                <Th>Tarih</Th>
                <Th>Paylaş</Th>
                <Th className="text-right">İşlemler</Th>
              </tr>
            </thead>
            <tbody>
              <EmptyRow colSpan={colSpan}>Henüz haber yok.</EmptyRow>
            </tbody>
          </Table>
        </div>
      </>
    );
  }

  return (
    <>
      <ArticleMobileList
        articles={articles}
        basePath={basePath}
        designBasePath={designBasePath}
        siteUrl={siteUrl}
        categories={categories}
      />
      <div className="hidden md:block">
        <Table>
          <thead>
            <tr>
              {designBasePath && <Th>Görsel</Th>}
              <Th>Başlık</Th>
              <Th>Kategori</Th>
              <Th>Yazar</Th>
              <Th>Durum</Th>
              <Th>Tarih</Th>
              <Th>Paylaş</Th>
              <Th className="text-right">İşlemler</Th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <ArticleTableRow
                key={a.id}
                article={a}
                basePath={basePath}
                designBasePath={designBasePath}
                siteUrl={siteUrl}
                categories={categories}
              />
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}

function ArticleTableRow({
  article: a,
  basePath,
  designBasePath,
  siteUrl,
  categories,
}: {
  article: ArticleRow;
  basePath: string;
  designBasePath?: string;
  siteUrl: string;
  categories: CategoryOption[];
}) {
  return (
    <tr>
      {designBasePath && (
        <Td>
          <CoverImage src={a.coverImageUrl} alt={a.title} className="h-12 w-16" sizes="64px" />
        </Td>
      )}
      <Td className="max-w-xs font-semibold text-ink">{a.title}</Td>
      <Td>
        <ArticleCategorySelect articleId={a.id} categoryId={a.categoryId} categories={categories} />
      </Td>
      <Td>{a.author.name}</Td>
      <Td>
        <Badge variant={STATUS_LABEL[a.status].variant}>{STATUS_LABEL[a.status].text}</Badge>
      </Td>
      <Td className="whitespace-nowrap text-xs text-ink-soft">
        {formatDate(a.publishedAt ?? a.createdAt)}
      </Td>
      <Td>
        {a.status === "PUBLISHED" ? (
          <ShareButtons url={`${siteUrl}/haber/${a.slug}`} title={a.title} size="sm" />
        ) : (
          <span className="text-xs text-ink-soft">—</span>
        )}
      </Td>
      <Td>
        <ArticleRowActions
          article={a}
          basePath={basePath}
          designBasePath={designBasePath}
          compact
        />
      </Td>
    </tr>
  );
}

function ArticleMobileList({
  articles,
  basePath,
  designBasePath,
  siteUrl,
  categories,
}: {
  articles: ArticleRow[];
  basePath: string;
  designBasePath?: string;
  siteUrl: string;
  categories: CategoryOption[];
}) {
  if (articles.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white px-4 py-12 text-center text-sm text-ink-soft md:hidden">
        Henüz haber yok.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3 md:hidden">
      {articles.map((a) => (
        <li
          key={a.id}
          className="overflow-hidden rounded-xl border border-border bg-white shadow-sm"
        >
          <div className="flex gap-3 p-3">
            {a.coverImageUrl ? (
              <CoverImage
                src={a.coverImageUrl}
                alt={a.title}
                className="h-20 w-24 shrink-0 rounded-md"
                sizes="96px"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Badge variant={STATUS_LABEL[a.status].variant}>
                  {STATUS_LABEL[a.status].text}
                </Badge>
                <span className="text-[11px] text-ink-soft">
                  {formatDate(a.publishedAt ?? a.createdAt)}
                </span>
              </div>
              <p className="line-clamp-2 text-sm font-bold leading-snug text-ink">{a.title}</p>
              <p className="mt-1 text-xs text-ink-soft">{a.author.name}</p>
            </div>
          </div>
          <div className="space-y-2 border-t border-border bg-surface/40 px-3 py-2.5">
            <ArticleCategorySelect
              articleId={a.id}
              categoryId={a.categoryId}
              categories={categories}
            />
            {a.status === "PUBLISHED" ? (
              <ShareButtons url={`${siteUrl}/haber/${a.slug}`} title={a.title} size="sm" />
            ) : null}
            <ArticleRowActions
              article={a}
              basePath={basePath}
              designBasePath={designBasePath}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ArticleRowActions({
  article: a,
  basePath,
  designBasePath,
  compact = false,
}: {
  article: ArticleRow;
  basePath: string;
  designBasePath?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "flex items-center justify-end gap-3"
          : "flex flex-wrap items-center gap-2"
      }
    >
      {designBasePath && (
        <Link
          href={`${designBasePath}/${a.id}`}
          className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-brand px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-brand sm:flex-none sm:px-2 sm:py-1"
        >
          <LayoutTemplate className="h-3.5 w-3.5" />
          Manşet
        </Link>
      )}
      {a.status === "PUBLISHED" && (
        <Link
          href={`/haber/${a.slug}`}
          target="_blank"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-ink-soft active:text-brand"
          title="Görüntüle"
        >
          <Eye className="h-4 w-4" />
        </Link>
      )}
      <Link
        href={`${basePath}/${a.id}`}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-ink-soft active:text-brand"
        title="Düzenle"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <DeleteButton id={a.id} action={deleteArticleAction} />
    </div>
  );
}
