"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, GripVertical, Tv } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input, Textarea } from "@/components/ui/FormField";
import { FormCard } from "@/components/admin/FormCard";
import { PanelCard } from "@/components/admin/PanelUI";
import { PanelFormFooter, PANEL_FORM_BOTTOM_PAD } from "@/components/admin/PanelFormFooter";
import { saveTvGuideAction } from "@/actions/appearance";
import {
  TV_CHANNELS,
  channelLogoUrl,
  type TvChannel,
} from "@/lib/broadcast";
import {
  parseSlugList,
  parseTvGuideDesign,
  type SettingKey,
  type TvGuideDesign,
} from "@/lib/settings";
import { cn } from "@/lib/utils";

export function TvGuideSettingsForm({
  settings,
}: {
  settings: Record<SettingKey, string>;
}) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(settings.tvPageTitle || "Yayın Akışı");
  const [intro, setIntro] = useState(settings.tvPageIntro || "");
  const [design, setDesign] = useState<TvGuideDesign>(() =>
    parseTvGuideDesign(settings.tvGuideDesign),
  );
  const [showOnHome, setShowOnHome] = useState(settings.showBroadcast !== "0");
  const [enabled, setEnabled] = useState<TvChannel[]>(() => {
    const savedSlugs = parseSlugList(settings.tvChannelSlugs);
    const bySlug = new Map(TV_CHANNELS.map((c) => [c.slug, c]));
    if (savedSlugs.length === 0) {
      return TV_CHANNELS.filter((c) => c.featured);
    }
    return savedSlugs.map((s) => bySlug.get(s)).filter((c): c is TvChannel => Boolean(c));
  });

  function toggleChannel(channel: TvChannel) {
    setSaved(false);
    setEnabled((prev) => {
      const exists = prev.some((c) => c.slug === channel.slug);
      if (exists) return prev.filter((c) => c.slug !== channel.slug);
      return [...prev, channel];
    });
  }

  function move(slug: string, dir: -1 | 1) {
    setSaved(false);
    setEnabled((prev) => {
      const i = prev.findIndex((c) => c.slug === slug);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const tmp = next[i]!;
      next[i] = next[j]!;
      next[j] = tmp;
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    await saveTvGuideAction({
      tvPageTitle: title,
      tvPageIntro: intro,
      tvGuideDesign: design,
      tvChannelSlugs: enabled.map((c) => c.slug).join(","),
      showBroadcast: showOnHome ? "1" : "0",
    });
    setLoading(false);
    setSaved(true);
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-6", PANEL_FORM_BOTTOM_PAD)}>
      <FormCard
        title="Sayfa metinleri"
        description="/yayin-akisi başlığı ve kısa açıklama."
        Icon={Tv}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldGroup label="Başlık" htmlFor="tv-title">
              <Input
                id="tv-title"
                value={title}
                onChange={(e) => {
                  setSaved(false);
                  setTitle(e.target.value);
                }}
              />
            </FieldGroup>
          </div>
          <div className="sm:col-span-2">
            <FieldGroup label="Açıklama" htmlFor="tv-intro">
              <Textarea
                id="tv-intro"
                value={intro}
                onChange={(e) => {
                  setSaved(false);
                  setIntro(e.target.value);
                }}
                rows={2}
              />
            </FieldGroup>
          </div>
        </div>
      </FormCard>

      <FormCard title="Tasarım" description="Program listesinin görünümü.">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {(
            [
              { id: "1", label: "1 · Zaman çizelgesi", hint: "Saat sütunu + satır listesi" },
              { id: "2", label: "2 · Kart ızgarası", hint: "Üç sütunlu program kartları" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setSaved(false);
                setDesign(opt.id);
              }}
              className={cn(
                "w-full rounded-xl border px-3 py-3 text-left transition-colors sm:min-w-[180px] sm:flex-1",
                design === opt.id
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-white text-ink hover:border-brand/40",
              )}
            >
              <span className="block text-sm font-bold">{opt.label}</span>
              <span
                className={cn(
                  "mt-0.5 block text-[11px]",
                  design === opt.id ? "text-white/80" : "text-ink-soft",
                )}
              >
                {opt.hint}
              </span>
            </button>
          ))}
        </div>
      </FormCard>

      <PanelCard padding={false}>
        <header className="flex flex-col gap-2 border-b border-border px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
          <div>
            <h3 className="text-sm font-bold text-ink">Kanallar</h3>
            <p className="mt-0.5 text-xs text-ink-soft">
              Açık kanallar sırayla gösterilir. Programlar otomatik güncellenir.
            </p>
          </div>
          <p className="text-xs font-semibold text-ink-soft">
            {enabled.length}/{TV_CHANNELS.length} seçili
          </p>
        </header>

        <div className="divide-y divide-border">
          {TV_CHANNELS.map((channel) => {
            const on = enabled.some((c) => c.slug === channel.slug);
            const order = enabled.findIndex((c) => c.slug === channel.slug);
            return (
              <div
                key={channel.slug}
                className={cn(
                  "flex flex-col gap-3 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:px-5",
                  !on && "bg-surface/70 opacity-70",
                )}
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  onClick={() => toggleChannel(channel)}
                  className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span
                    className={cn(
                      "relative h-6 w-10 shrink-0 rounded-md border transition-colors",
                      on ? "border-brand bg-brand" : "border-border bg-surface",
                    )}
                    aria-hidden
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-md bg-white shadow-sm transition-[left]",
                        on ? "left-[18px]" : "left-0.5",
                      )}
                    />
                  </span>
                  <span className="flex h-9 w-14 items-center justify-center rounded-lg border border-border bg-white px-1">
                    <img
                      src={channelLogoUrl(channel.id)}
                      alt=""
                      width={48}
                      height={24}
                      className="h-5 w-auto max-w-[48px] object-contain"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-ink">{channel.name}</span>
                    <span className="text-[11px] text-ink-soft">{channel.slug}</span>
                  </span>
                </button>

                {on ? (
                  <span className="panel-row-actions flex w-full items-center justify-end gap-1 sm:w-auto">
                    {order >= 0 ? (
                      <span className="mr-1 text-[10px] font-bold text-brand">{order + 1}</span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => move(channel.slug, -1)}
                      className="flex h-11 min-w-11 items-center justify-center rounded-md border border-border text-xs font-bold text-ink-soft hover:border-ink/30"
                      title="Yukarı"
                      aria-label="Yukarı taşı"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(channel.slug, 1)}
                      className="flex h-11 min-w-11 items-center justify-center rounded-md border border-border text-xs font-bold text-ink-soft hover:border-ink/30"
                      title="Aşağı"
                      aria-label="Aşağı taşı"
                    >
                      ↓
                    </button>
                    <GripVertical className="hidden h-4 w-4 text-ink-soft/50 sm:block" aria-hidden />
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </PanelCard>

      <PanelCard padding={false}>
        <button
          type="button"
          role="switch"
          aria-checked={showOnHome}
          onClick={() => {
            setSaved(false);
            setShowOnHome((v) => !v);
          }}
          className="flex min-h-[44px] w-full items-start gap-3 px-4 py-4 text-left sm:px-5"
        >
          <span
            className={cn(
              "relative mt-0.5 h-6 w-10 shrink-0 rounded-md border transition-colors",
              showOnHome ? "border-brand bg-brand" : "border-border bg-surface",
            )}
            aria-hidden
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-md bg-white shadow-sm transition-[left]",
                showOnHome ? "left-[18px]" : "left-0.5",
              )}
            />
          </span>
          <span>
            <span className="block text-sm font-bold text-ink">Anasayfada yayın akışı şeridi</span>
            <span className="mt-0.5 block text-sm text-ink-soft">
              Seçili kanalların şu anki programını manşet altında gösterir.
            </span>
          </span>
        </button>
      </PanelCard>

      <PanelFormFooter>
        <div className="mr-auto hidden w-full text-sm text-ink-soft sm:block sm:w-auto">
          {enabled.length} kanal
          {saved ? " · Kaydedildi" : ""}
        </div>
        <Button href="/yayin-akisi" variant="outline" className="w-full sm:w-auto">
          Sayfayı aç
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
        <Button type="submit" disabled={loading || enabled.length === 0} className="w-full sm:w-auto">
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </PanelFormFooter>
      <p className="text-center text-sm text-ink-soft sm:hidden">
        {enabled.length} kanal seçili
        {saved ? " · Kaydedildi" : ""}
      </p>
      <Link
        href="/admin/gorunum/ogeler"
        className="block text-center text-sm font-semibold text-ink-soft hover:text-brand sm:text-left"
      >
        Öğeler paneline git →
      </Link>
    </form>
  );
}
