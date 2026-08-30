import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Th, Td, EmptyRow } from "@/components/admin/Table";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { HaberBotSourceForm } from "@/components/admin/HaberBotSourceForm";
import { HaberBotWordForm } from "@/components/admin/HaberBotWordForm";
import { HaberBotFetchButton } from "@/components/admin/HaberBotFetchButton";
import { HaberBotToggle } from "@/components/admin/HaberBotToggle";
import { SectionHeader } from "@/components/admin/PanelUI";
import {
  deleteHaberBotSourceAction,
  deleteHaberBotWordAction,
  toggleHaberBotSourceAction,
  toggleHaberBotWordAction,
} from "@/actions/haber-bot";
import { formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export const metadata = { title: "Haber Botu" };

const LOG_LABEL: Record<string, { text: string; variant: "brand" | "outline" | "dark" }> = {
  imported: { text: "Eklendi", variant: "brand" },
  skipped: { text: "Atlandı", variant: "outline" },
  error: { text: "Hata", variant: "dark" },
};

export default async function HaberBotPage() {
  const [categories, sources, words, logs] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
    prisma.haberBotSource.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: { select: { name: true } } },
    }),
    prisma.haberBotWord.findMany({ orderBy: { order: "asc" } }),
    prisma.haberBotLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      include: { source: { select: { name: true } } },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Haber Botu"
        description="Sitelerden haber çekin. RSS yoksa da ana sayfa adresinden dener; kelimeler kalıba göre değişir."
        action={<HaberBotFetchButton label="Aktif kaynakları çek" size="md" />}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <HaberBotSourceForm categories={categories} />
        <HaberBotWordForm />
      </div>

      <div className="mt-8">
        <SectionHeader title="Kaynaklar" description="Çekim için açık olan siteler." />
        <Table>
          <thead>
            <tr>
              <Th>Site</Th>
              <Th>Kategori</Th>
              <Th>Durum</Th>
              <Th>Son çekim</Th>
              <Th className="text-right">İşlem</Th>
            </tr>
          </thead>
          <tbody>
            {sources.length === 0 ? (
              <EmptyRow colSpan={5}>Henüz kaynak yok. Yukarıdan site ekleyin.</EmptyRow>
            ) : (
              sources.map((source) => (
                <tr key={source.id}>
                  <Td>
                    <div className="font-semibold text-ink">{source.name}</div>
                    <div className="mt-0.5 max-w-xs truncate text-xs text-ink-soft">{source.url}</div>
                    {source.lastError ? (
                      <p className="mt-1 text-xs font-medium text-brand">{source.lastError}</p>
                    ) : null}
                  </Td>
                  <Td>
                    {source.category.name}
                    <div className="mt-0.5 text-xs text-ink-soft">
                      Son {source.maxItems} · {source.importStatus === "PUBLISHED" ? "Yayınla" : "Taslak"}
                    </div>
                  </Td>
                  <Td>
                    <HaberBotToggle
                      id={source.id}
                      active={source.enabled}
                      action={toggleHaberBotSourceAction}
                    />
                  </Td>
                  <Td className="whitespace-nowrap text-xs text-ink-soft">
                    {source.lastFetchedAt ? formatRelativeTime(source.lastFetchedAt) : "—"}
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-3">
                      <HaberBotFetchButton sourceId={source.id} />
                      <DeleteButton
                        id={source.id}
                        action={deleteHaberBotSourceAction}
                        confirmText="Bu kaynağı silmek istiyor musunuz?"
                      />
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <div className="mt-8">
        <SectionHeader
          title="Kelime listesi"
          description="Çekim sırasında başlık, spot ve metne uygulanır."
        />
        <Table>
          <thead>
            <tr>
              <Th>Eski</Th>
              <Th>Yeni</Th>
              <Th>Durum</Th>
              <Th className="text-right">İşlem</Th>
            </tr>
          </thead>
          <tbody>
            {words.length === 0 ? (
              <EmptyRow colSpan={4}>Henüz kural yok. Tek tek ekleyin veya kalıbı yapıştırın.</EmptyRow>
            ) : (
              words.map((word) => (
                <tr key={word.id}>
                  <Td className="font-semibold text-ink">{word.find}</Td>
                  <Td className="text-ink-soft">
                    {word.replace || <span className="italic">sil</span>}
                  </Td>
                  <Td>
                    <HaberBotToggle
                      id={word.id}
                      active={word.active}
                      action={toggleHaberBotWordAction}
                    />
                  </Td>
                  <Td>
                    <div className="flex justify-end">
                      <DeleteButton id={word.id} action={deleteHaberBotWordAction} />
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <div className="mt-8">
        <SectionHeader title="Çekim kaydı" description="Son çekilen, atlanan ve hatalı haberler." />
        <Table>
          <thead>
            <tr>
              <Th>Haber</Th>
              <Th>Kaynak</Th>
              <Th>Sonuç</Th>
              <Th>Zaman</Th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <EmptyRow colSpan={4}>Henüz çekim yok.</EmptyRow>
            ) : (
              logs.map((log) => {
                const badge = LOG_LABEL[log.status] ?? LOG_LABEL.error;
                return (
                  <tr key={log.id}>
                    <Td className="max-w-sm">
                      {log.articleId ? (
                        <Link
                          href={`/admin/makaleler/${log.articleId}`}
                          className="font-semibold text-ink hover:text-brand"
                        >
                          {log.title}
                        </Link>
                      ) : (
                        <span className="font-medium text-ink">{log.title}</span>
                      )}
                      {log.message ? (
                        <div className="mt-0.5 text-xs text-ink-soft">{log.message}</div>
                      ) : null}
                    </Td>
                    <Td className="text-ink-soft">{log.source?.name ?? "—"}</Td>
                    <Td>
                      <Badge variant={badge.variant}>{badge.text}</Badge>
                    </Td>
                    <Td className="whitespace-nowrap text-xs text-ink-soft">
                      {formatRelativeTime(log.createdAt)}
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}
