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
import { HaberBotSourceForm } from "@/components/admin/HaberBotSourceForm";
import { HaberBotWordForm } from "@/components/admin/HaberBotWordForm";
import { HaberBotFetchButton } from "@/components/admin/HaberBotFetchButton";
import { HaberBotToggle } from "@/components/admin/HaberBotToggle";
import { HaberBotLogsPanel } from "@/components/admin/HaberBotLogsPanel";
import { SectionHeader } from "@/components/admin/PanelUI";
import { CollapsibleSection } from "@/components/admin/CollapsibleSection";
import {
  deleteHaberBotSourceAction,
  deleteHaberBotWordAction,
  toggleHaberBotSourceAction,
  toggleHaberBotWordAction,
} from "@/actions/haber-bot";
import { formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "Haber Botu" };

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
      take: 80,
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

        <PanelMobileOnly>
          {sources.length === 0 ? (
            <PanelMobileEmpty>Henüz kaynak yok. Yukarıdan site ekleyin.</PanelMobileEmpty>
          ) : (
            <PanelMobileList>
              {sources.map((source) => (
                <PanelMobileCard key={source.id}>
                  <PanelMobileCardBody
                    footer={
                      <div className="flex flex-col gap-3">
                        <HaberBotToggle
                          id={source.id}
                          active={source.enabled}
                          action={toggleHaberBotSourceAction}
                        />
                        <div className="panel-row-actions flex flex-wrap items-center justify-end gap-2">
                          <HaberBotFetchButton sourceId={source.id} />
                          <DeleteButton
                            id={source.id}
                            action={deleteHaberBotSourceAction}
                            confirmText="Bu kaynağı silmek istiyor musunuz?"
                          />
                        </div>
                      </div>
                    }
                  >
                    <p className="font-semibold text-ink">{source.name}</p>
                    <p className="mt-1 break-all text-xs text-ink-soft">{source.url}</p>
                    {source.lastError ? (
                      <p className="mt-2 text-xs font-medium text-brand">{source.lastError}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-ink-soft">
                      {source.category.name} · Son {source.maxItems} ·{" "}
                      {source.importStatus === "PUBLISHED" ? "Yayınla" : "Taslak"}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-soft">
                      Son çekim:{" "}
                      {source.lastFetchedAt ? formatRelativeTime(source.lastFetchedAt) : "—"}
                    </p>
                  </PanelMobileCardBody>
                </PanelMobileCard>
              ))}
            </PanelMobileList>
          )}
        </PanelMobileOnly>

        <PanelDesktopOnly>
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
        </PanelDesktopOnly>
      </div>

      <div className="mt-8">
        <CollapsibleSection
          title="Kelime listesi"
          description="Çekim sırasında başlık, spot ve metne uygulanır."
          defaultOpen={false}
        >
          <PanelMobileOnly>
          {words.length === 0 ? (
            <PanelMobileEmpty>Henüz kural yok. Tek tek ekleyin veya kalıbı yapıştırın.</PanelMobileEmpty>
          ) : (
            <PanelMobileList>
              {words.map((word) => (
                <PanelMobileCard key={word.id}>
                  <PanelMobileCardBody
                    footer={
                      <div className="flex items-center justify-between gap-2">
                        <HaberBotToggle
                          id={word.id}
                          active={word.active}
                          action={toggleHaberBotWordAction}
                        />
                        <DeleteButton id={word.id} action={deleteHaberBotWordAction} />
                      </div>
                    }
                  >
                    <p className="text-sm">
                      <span className="font-semibold text-ink">{word.find}</span>
                      <span className="text-ink-soft"> → </span>
                      <span className="text-ink-soft">
                        {word.replace || <span className="italic">sil</span>}
                      </span>
                    </p>
                  </PanelMobileCardBody>
                </PanelMobileCard>
              ))}
            </PanelMobileList>
          )}
        </PanelMobileOnly>

        <PanelDesktopOnly>
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
        </PanelDesktopOnly>
        </CollapsibleSection>
      </div>

      <div className="mt-8">
        <SectionHeader
          title="Çekim kaydı"
          description="Son çekilen, atlanan ve hatalı haberler. Silince eklenen haber de gider."
        />
        <HaberBotLogsPanel
          logs={logs.map((log) => ({
            id: log.id,
            title: log.title,
            status: log.status,
            message: log.message,
            articleId: log.articleId,
            sourceName: log.source?.name ?? null,
            createdAt: log.createdAt.toISOString(),
          }))}
        />
      </div>
    </>
  );
}
