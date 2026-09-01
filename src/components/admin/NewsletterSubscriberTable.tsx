"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, Newspaper } from "lucide-react";
import { sendArticleNewsletterAction } from "@/actions/newsletter";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { FormCard } from "@/components/admin/FormCard";
import {
  PanelDesktopOnly,
  PanelMobileCard,
  PanelMobileCardBody,
  PanelMobileEmpty,
  PanelMobileList,
  PanelMobileOnly,
} from "@/components/admin/PanelMobileList";
import { Table, Th, Td, EmptyRow } from "@/components/admin/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { deleteNewsletterSubscriberAction } from "@/actions/newsletter";
import { formatDate } from "@/lib/utils";

export type NewsletterSubscriberRow = {
  id: string;
  email: string;
  name: string | null;
  source: string;
  status: string;
  createdAt: string;
};

export type NewsletterArticleOption = {
  id: string;
  title: string;
  publishedAt: string | null;
};

function sourceLabel(source: string) {
  if (source === "panel") return "Panel";
  if (source === "import") return "Aktarım";
  return "Site";
}

export function NewsletterSubscriberTable({
  subscribers,
  articles,
}: {
  subscribers: NewsletterSubscriberRow[];
  articles: NewsletterArticleOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [articleId, setArticleId] = useState(articles[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);

  const activeSubscribers = useMemo(
    () => subscribers.filter((s) => s.status === "ACTIVE"),
    [subscribers],
  );
  const activeIds = useMemo(() => new Set(activeSubscribers.map((s) => s.id)), [activeSubscribers]);
  const selectedActiveCount = useMemo(
    () => [...selected].filter((id) => activeIds.has(id)).length,
    [selected, activeIds],
  );
  const allActiveSelected =
    activeSubscribers.length > 0 && selectedActiveCount === activeSubscribers.length;

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleAllActive = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(activeSubscribers.map((s) => s.id)));
    } else {
      setSelected(new Set());
    }
  };

  const send = (sendToAll: boolean) => {
    if (!articleId) {
      setMessage("Göndermek için bir haber seçin.");
      return;
    }

    const count = sendToAll ? activeSubscribers.length : selectedActiveCount;
    if (count === 0) {
      setMessage("Gönderilecek aktif abone yok.");
      return;
    }

    const articleTitle = articles.find((a) => a.id === articleId)?.title ?? "haber";
    if (
      !window.confirm(
        sendToAll
          ? `"${articleTitle}" başlıklı haber ${count} aktif aboneye gönderilecek. Devam?`
          : `"${articleTitle}" başlıklı haber seçili ${count} aboneye gönderilecek. Devam?`,
      )
    ) {
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const result = await sendArticleNewsletterAction({
        articleId,
        sendToAll,
        subscriberIds: sendToAll ? undefined : [...selected],
      });
      if (result.error && !result.sentCount) {
        setMessage(result.error);
        return;
      }
      setMessage(
        `${result.sentCount ?? 0} kişiye gönderildi${result.failCount ? `, ${result.failCount} hata` : ""}.`,
      );
      if (!sendToAll) setSelected(new Set());
      router.refresh();
    });
  };

  return (
    <div className="mt-8 space-y-6">
      <FormCard
        title="Haber gönder"
        description="Yayındaki bir haberi seçin; tüm aktif abonelere veya işaretlediklerinize gönderin."
        Icon={Newspaper}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="newsletter-article" className="mb-1 block text-sm font-semibold text-ink">
              Haber seçin
            </label>
            <select
              id="newsletter-article"
              value={articleId}
              onChange={(e) => setArticleId(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              {articles.length === 0 ? (
                <option value="">Yayında haber yok</option>
              ) : (
                articles.map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.title}
                    {article.publishedAt
                      ? ` — ${new Date(article.publishedAt).toLocaleDateString("tr-TR")}`
                      : ""}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={() => send(true)}
              disabled={pending || !articleId || activeSubscribers.length === 0}
            >
              <Mail className="mr-1.5 inline h-4 w-4" aria-hidden />
              {pending ? "Gönderiliyor..." : `Tüm aktif abonelere gönder (${activeSubscribers.length})`}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => send(false)}
              disabled={pending || !articleId || selectedActiveCount === 0}
            >
              Seçilenlere gönder ({selectedActiveCount})
            </Button>
          </div>

          {message ? <p className="text-sm text-ink-soft">{message}</p> : null}
        </div>
      </FormCard>

      <PanelMobileOnly>
        {subscribers.length === 0 ? (
          <PanelMobileEmpty>Henüz abone yok.</PanelMobileEmpty>
        ) : (
          <>
            {activeSubscribers.length > 0 ? (
              <label className="mb-3 flex min-h-11 items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={allActiveSelected}
                  onChange={(e) => toggleAllActive(e.target.checked)}
                  aria-label="Tüm aktif aboneleri seç"
                  className="h-4 w-4 rounded border-border"
                />
                Tüm aktif aboneleri seç
              </label>
            ) : null}
            <PanelMobileList>
              {subscribers.map((s) => {
                const isActive = s.status === "ACTIVE";
                return (
                  <PanelMobileCard
                    key={s.id}
                    className={selected.has(s.id) ? "ring-2 ring-brand/20" : undefined}
                  >
                    <PanelMobileCardBody
                      footer={
                        <div className="panel-row-actions flex items-center justify-between gap-2">
                          <label className="flex min-h-11 items-center gap-2 text-sm text-ink-soft">
                            <input
                              type="checkbox"
                              checked={selected.has(s.id)}
                              onChange={(e) => toggleOne(s.id, e.target.checked)}
                              disabled={!isActive}
                              aria-label={`${s.email} seç`}
                              className="h-4 w-4 rounded border-border disabled:opacity-40"
                            />
                            Seç
                          </label>
                          <DeleteButton id={s.id} action={deleteNewsletterSubscriberAction} />
                        </div>
                      }
                    >
                      <p className="break-all font-semibold text-ink">{s.email}</p>
                      {s.name ? (
                        <p className="mt-1 text-sm text-ink-soft">{s.name}</p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant={isActive ? "brand" : "outline"}>
                          {isActive ? "Aktif" : "Ayrıldı"}
                        </Badge>
                        <span className="text-xs text-ink-soft">{sourceLabel(s.source)}</span>
                        <span className="text-xs text-ink-soft">
                          {formatDate(new Date(s.createdAt))}
                        </span>
                      </div>
                    </PanelMobileCardBody>
                  </PanelMobileCard>
                );
              })}
            </PanelMobileList>
          </>
        )}
      </PanelMobileOnly>

      <PanelDesktopOnly>
        <Table>
          <thead>
            <tr>
              <Th className="w-10">
                <input
                  type="checkbox"
                  checked={allActiveSelected}
                  onChange={(e) => toggleAllActive(e.target.checked)}
                  aria-label="Tüm aktif aboneleri seç"
                  className="h-4 w-4 rounded border-border"
                  disabled={activeSubscribers.length === 0}
                />
              </Th>
              <Th>E-posta</Th>
              <Th>Ad</Th>
              <Th>Kaynak</Th>
              <Th>Durum</Th>
              <Th>Tarih</Th>
              <Th className="text-right">İşlem</Th>
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 ? (
              <EmptyRow colSpan={7}>Henüz abone yok.</EmptyRow>
            ) : (
              subscribers.map((s) => {
                const isActive = s.status === "ACTIVE";
                return (
                  <tr key={s.id} className={selected.has(s.id) ? "bg-brand/[0.03]" : undefined}>
                    <Td>
                      <input
                        type="checkbox"
                        checked={selected.has(s.id)}
                        onChange={(e) => toggleOne(s.id, e.target.checked)}
                        disabled={!isActive}
                        aria-label={`${s.email} seç`}
                        className="h-4 w-4 rounded border-border disabled:opacity-40"
                      />
                    </Td>
                    <Td className="font-semibold text-ink">{s.email}</Td>
                    <Td className="text-ink-soft">{s.name || "—"}</Td>
                    <Td className="text-xs text-ink-soft">{sourceLabel(s.source)}</Td>
                    <Td>
                      <Badge variant={isActive ? "brand" : "outline"}>
                        {isActive ? "Aktif" : "Ayrıldı"}
                      </Badge>
                    </Td>
                    <Td className="whitespace-nowrap text-xs text-ink-soft">
                      {formatDate(new Date(s.createdAt))}
                    </Td>
                    <Td>
                      <div className="flex justify-end">
                        <DeleteButton id={s.id} action={deleteNewsletterSubscriberAction} />
                      </div>
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </PanelDesktopOnly>
    </div>
  );
}
