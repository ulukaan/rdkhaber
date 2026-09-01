"use client";

import { clientFormSubmit } from "@/lib/client-form";

import { useState } from "react";
import {
  BarChart3,
  Bookmark,
  Clapperboard,
  Folders,
  GalleryHorizontal,
  ImageIcon,
  LayoutGrid,
  LineChart,
  List,
  MessageCircle,
  Mic,
  Newspaper,
  PenLine,
  Radio,
  Rows3,
  Sparkles,
  Sun,
  Sunrise,
  Trophy,
  TrendingUp,
  Flame,
  Tv,
  Vote,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { saveHomepageModulesAction } from "@/actions/appearance";
import { parseCategoryBlocks, serializeCategoryBlocks, parseSlugList, serializeSlugList, parseParityDesign, parseImsakiyeDesign, type CategoryBlockLayout, type ImsakiyeDesign, type ParityDesign, type SettingKey } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/admin/PanelUI";
import { PanelFormFooter, PANEL_FORM_BOTTOM_PAD } from "@/components/admin/PanelFormFooter";

type CategoryOption = { name: string; slug: string };

type ModuleDef = {
  key: SettingKey;
  label: string;
  hint: string;
  Icon: typeof TrendingUp;
  wide?: boolean;
};

const MAX_CATEGORY_CARDS = 8;
const MAX_SPOTLIGHT_TABS = 12;

const GROUPS: Array<{
  title: string;
  description: string;
  items: ModuleDef[];
}> = [
  {
    title: "Üst şerit",
    description: "Logo altındaki kur ve son dakika bantları. Sayfa kayınca gizlenir.",
    items: [
      {
        key: "showRates",
        label: "Kur şeridi",
        hint: "Döviz, emtia, borsa ve kripto — 5 saniyede bir değişir",
        Icon: TrendingUp,
      },
      {
        key: "showTicker",
        label: "Son dakika",
        hint: "Kırmızı kayan haber bandı",
        Icon: Radio,
      },
    ],
  },
  {
    title: "Ana sayfa",
    description: "Manşetten galeriye, sayfanın gövde blokları.",
    items: [
      {
        key: "showTopHeadlines",
        label: "Üst manşet kartları",
        hint: "4’lü poster sıra",
        Icon: LayoutGrid,
      },
      {
        key: "showFeatured",
        label: "Ana manşet slaytı",
        hint: "Numaralı büyük manşet",
        Icon: Newspaper,
      },
      {
        key: "showLatestFeed",
        label: "Güncel haberler",
        hint: "Manşet altı grid",
        Icon: List,
      },
      {
        key: "showCategorySpotlight",
        label: "Kategori sekmeleri",
        hint: "Anasayfa sekme bloğu — hangi kategorilerin görüneceğini seçin",
        Icon: Folders,
        wide: true,
      },
      {
        key: "showCategoryCards",
        label: "Kategori kartları",
        hint: "Kategori 3 / 4 / 5 haber blokları — her kategoriye tasarım seçin",
        Icon: GalleryHorizontal,
        wide: true,
      },
      {
        key: "showVideos",
        label: "Video haberler",
        hint: "Video kartları",
        Icon: Clapperboard,
      },
      {
        key: "showDayHeadlines",
        label: "Günün manşetleri",
        hint: "1 büyük + 4’lü grid",
        Icon: Sun,
      },
      {
        key: "showGundemBand",
        label: "Gündem bandı",
        hint: "Kırmızı başlıklı kategori bloğu",
        Icon: Rows3,
      },
      {
        key: "showInterviews",
        label: "Röportaj",
        hint: "4’lü mikrofonlu kartlar",
        Icon: Mic,
      },
      {
        key: "showPhotoGallery",
        label: "Foto galeri",
        hint: "Büyük görsel + yan liste",
        Icon: ImageIcon,
      },
      {
        key: "showEditorNews",
        label: "Editör haberleri",
        hint: "Yazar imzalı 5’li sıra",
        Icon: PenLine,
      },
    ],
  },
  {
    title: "Yan sütun",
    description: "Masaüstünde sağda duran bloklar.",
    items: [
      {
        key: "showMostRead",
        label: "Çok okunanlar",
        hint: "Sağ sütun listesi",
        Icon: BarChart3,
      },
      {
        key: "showTrendingWeek",
        label: "Haftanın trendi",
        hint: "Son 7 günde en çok okunanlar",
        Icon: Flame,
      },
      {
        key: "showMostCommented",
        label: "En çok yorumlanan",
        hint: "Onaylı yorum sayısına göre",
        Icon: MessageCircle,
      },
      {
        key: "showMostBookmarked",
        label: "En çok kaydedilen",
        hint: "Üyelerin kaydettiği haberler",
        Icon: Bookmark,
      },
      {
        key: "showPoll",
        label: "Anket",
        hint: "Aktif ana sayfa anketini göster",
        Icon: BarChart3,
      },
      {
        key: "showForYou",
        label: "Senin için",
        hint: "Giriş yapmış üyelere kişisel öneri bloğu",
        Icon: Sparkles,
      },
    ],
  },
  {
    title: "Servisler",
    description: "Manşetin altında duran piyasa, imsakiye, burç, skor ve yayın akışı.",
    items: [
      {
        key: "showParity",
        label: "Parite",
        hint: "Döviz, altın, borsa ve kripto — tasarım 1 / 2 / 3",
        Icon: LineChart,
        wide: true,
      },
      {
        key: "showImsakiye",
        label: "İmsakiye",
        hint: "Düzce namaz vakitleri — tasarım 1 / 2",
        Icon: Sunrise,
        wide: true,
      },
      {
        key: "showHoroscope",
        label: "Günlük burç",
        hint: "12 burç günlük yorumu — otomatik yenilenir",
        Icon: Sparkles,
      },
      {
        key: "showLiveScore",
        label: "Canlı skor",
        hint: "Lig filtresi + yatay maç şeridi — 1 dk’da bir yenilenir",
        Icon: Trophy,
      },
      {
        key: "showBroadcast",
        label: "Yayın akışı",
        hint: "Ulusal kanalların anlık programı — 5 dk’da bir yenilenir",
        Icon: Tv,
      },
      {
        key: "showElection",
        label: "Seçim şeridi",
        hint: "Üst seçim bandı — seçim kaydında “Anasayfada göster” açık olmalı",
        Icon: Vote,
      },
    ],
  },
];

const ALL_KEYS = GROUPS.flatMap((g) => g.items.map((i) => i.key));

function Switch({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "relative h-6 w-10 shrink-0 rounded-md border transition-colors duration-200",
        on ? "border-brand bg-brand" : "border-border bg-surface",
      )}
      aria-hidden
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-md bg-white shadow-sm transition-[left] duration-200",
          on ? "left-[18px]" : "left-0.5",
        )}
      />
    </span>
  );
}

export function HomepageModulesForm({
  settings,
  categories,
}: {
  settings: Record<SettingKey, string>;
  categories: CategoryOption[];
}) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ALL_KEYS.map((key) => [key, settings[key] !== "0"])),
  );
  const [cardBlocks, setCardBlocks] = useState(() => {
    const savedBlocks = parseCategoryBlocks(settings.categoryCardSlugs).filter((block) =>
      categories.some((c) => c.slug === block.slug),
    );
    if (savedBlocks.length > 0) return savedBlocks;
    return categories.slice(0, 3).map((c, i) => ({
      slug: c.slug,
      layout: (["3", "4", "5"] as const)[i % 3],
    }));
  });
  const [spotlightSlugs, setSpotlightSlugs] = useState(() =>
    parseSlugList(settings.categorySpotlightSlugs).filter((slug) =>
      categories.some((c) => c.slug === slug),
    ),
  );

  const [parityDesign, setParityDesign] = useState<ParityDesign>(() =>
    parseParityDesign(settings.parityDesign),
  );
  const [imsakiyeDesign, setImsakiyeDesign] = useState<ImsakiyeDesign>(() =>
    parseImsakiyeDesign(settings.imsakiyeDesign),
  );

  const onCount = ALL_KEYS.filter((key) => enabled[key]).length;
  const LAYOUTS: CategoryBlockLayout[] = ["3", "4", "5"];
  const PARITY_DESIGNS: ParityDesign[] = ["1", "2", "3"];
  const IMSAKIYE_DESIGNS: ImsakiyeDesign[] = ["1", "2"];

  function toggle(key: SettingKey) {
    setSaved(false);
    setEnabled((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleCardSlug(slug: string) {
    setSaved(false);
    setCardBlocks((prev) => {
      if (prev.some((b) => b.slug === slug)) return prev.filter((b) => b.slug !== slug);
      if (prev.length >= MAX_CATEGORY_CARDS) return prev;
      const layout = LAYOUTS[prev.length % 3];
      return [...prev, { slug, layout }];
    });
  }

  function toggleSpotlightSlug(slug: string) {
    setSaved(false);
    setSpotlightSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_SPOTLIGHT_TABS) return prev;
      return [...prev, slug];
    });
  }

  function setCardLayout(slug: string, layout: CategoryBlockLayout) {
    setSaved(false);
    setCardBlocks((prev) => prev.map((b) => (b.slug === slug ? { ...b, layout } : b)));
  }

  async function onSubmit() {
    setLoading(true);
    setSaved(false);
    const raw = Object.fromEntries(ALL_KEYS.map((key) => [key, enabled[key] ? "1" : "0"]));
    raw.categoryCardSlugs = serializeCategoryBlocks(cardBlocks);
    raw.categorySpotlightSlugs = serializeSlugList(spotlightSlugs);
    raw.parityDesign = parityDesign;
    raw.imsakiyeDesign = imsakiyeDesign;
    await saveHomepageModulesAction(raw);
    setLoading(false);
    setSaved(true);
  }

  return (
    <form onSubmit={clientFormSubmit(onSubmit)} className={cn("space-y-8", PANEL_FORM_BOTTOM_PAD)}>
      {GROUPS.map((group) => (
        <section key={group.title}>
          <header className="mb-3">
            <SectionHeader title={group.title} description={group.description} className="mb-0" />
          </header>
          <div
            className={cn(
              "grid gap-3 overflow-hidden",
              group.items.length > 1 && "sm:grid-cols-2",
            )}
          >
            {group.items.map((item) => {
              const on = enabled[item.key];
              return (
                <div
                  key={item.key}
                  className={cn(
                    "rounded-xl border border-border bg-white shadow-sm transition-colors duration-200",
                    !on && "bg-surface/80",
                    item.wide && "sm:col-span-2",
                  )}
                >
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    onClick={() => toggle(item.key)}
                    className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200",
                        on
                          ? "border-brand/20 bg-brand/10 text-brand"
                          : "border-border bg-white text-ink-soft",
                      )}
                    >
                      <item.Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                        <span className="text-sm font-bold text-ink">{item.label}</span>
                        <span className="flex items-center justify-between gap-2 sm:justify-end">
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wide",
                              on ? "text-brand" : "text-ink-soft",
                            )}
                          >
                            {on ? "Açık" : "Kapalı"}
                          </span>
                          <Switch on={on} />
                        </span>
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-soft">{item.hint}</span>
                    </span>
                  </button>

                  {item.key === "showCategorySpotlight" ? (
                    <div className="border-t border-border px-4 py-3">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                        Sekme kategorileri · {spotlightSlugs.length}/{MAX_SPOTLIGHT_TABS}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {categories.map((cat) => {
                          const selected = spotlightSlugs.includes(cat.slug);
                          const order = selected ? spotlightSlugs.indexOf(cat.slug) + 1 : null;
                          return (
                            <button
                              key={cat.slug}
                              type="button"
                              onClick={() => toggleSpotlightSlug(cat.slug)}
                              disabled={!selected && spotlightSlugs.length >= MAX_SPOTLIGHT_TABS}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-bold transition-colors disabled:opacity-40",
                                selected
                                  ? "border-brand/30 bg-brand/5 text-ink"
                                  : "border-border bg-white text-ink-soft hover:border-ink/30",
                              )}
                            >
                              {order ? <span className="text-[10px] text-brand">{order}</span> : null}
                              {cat.name}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-[11px] text-ink-soft">
                        Seçim sırası sekme sırasıdır. Hiç seçmezseniz tüm kategoriler listelenir.
                      </p>
                    </div>
                  ) : null}

                  {item.key === "showCategoryCards" ? (
                    <div className="border-t border-border px-4 py-3">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                        Kategoriler ve tasarım · {cardBlocks.length}/{MAX_CATEGORY_CARDS}
                      </p>
                      <div className="flex flex-col gap-2">
                        {categories.map((cat) => {
                          const selected = cardBlocks.find((b) => b.slug === cat.slug);
                          const order = selected
                            ? cardBlocks.findIndex((b) => b.slug === cat.slug) + 1
                            : null;
                          return (
                            <div
                              key={cat.slug}
                              className={cn(
                                "flex flex-wrap items-center gap-2 border px-2.5 py-1.5",
                                selected ? "border-brand/30 bg-brand/5" : "border-border bg-white",
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => toggleCardSlug(cat.slug)}
                                disabled={!selected && cardBlocks.length >= MAX_CATEGORY_CARDS}
                                className="inline-flex min-w-0 flex-1 items-center gap-1.5 text-left text-xs font-bold text-ink disabled:opacity-40"
                              >
                                {order ? (
                                  <span className="text-[10px] text-brand">{order}</span>
                                ) : null}
                                {cat.name}
                              </button>
                              {selected ? (
                                <span className="flex shrink-0 gap-1">
                                  {LAYOUTS.map((layout) => (
                                    <button
                                      key={layout}
                                      type="button"
                                      onClick={() => setCardLayout(cat.slug, layout)}
                                      className={cn(
                                        "h-6 w-6 text-[11px] font-extrabold transition-colors",
                                        selected.layout === layout
                                          ? "bg-brand text-white"
                                          : "border border-border bg-white text-ink-soft hover:border-ink/30",
                                      )}
                                      title={`Kategori ${layout}`}
                                    >
                                      {layout}
                                    </button>
                                  ))}
                                </span>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-[11px] text-ink-soft">
                        3: büyük görsel + 4’lü · 4: dört eşit kart · 5: başlık görselin altında
                      </p>
                    </div>
                  ) : null}

                  {item.key === "showParity" ? (
                    <div className="border-t border-border px-4 py-3">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                        Parite tasarımı
                      </p>
                      <div className="flex gap-1.5">
                        {PARITY_DESIGNS.map((design) => (
                          <button
                            key={design}
                            type="button"
                            onClick={() => {
                              setSaved(false);
                              setParityDesign(design);
                            }}
                            className={cn(
                              "h-8 min-w-8 rounded-md px-2.5 text-xs font-extrabold transition-colors",
                              parityDesign === design
                                ? "bg-brand text-white"
                                : "border border-border bg-white text-ink-soft hover:border-ink/30",
                            )}
                          >
                            {design}
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-[11px] text-ink-soft">
                        1: koyu şerit · 2: beyaz kutular · 3: kompakt satır
                      </p>
                    </div>
                  ) : null}

                  {item.key === "showImsakiye" ? (
                    <div className="border-t border-border px-4 py-3">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                        İmsakiye tasarımı
                      </p>
                      <div className="flex gap-1.5">
                        {IMSAKIYE_DESIGNS.map((design) => (
                          <button
                            key={design}
                            type="button"
                            onClick={() => {
                              setSaved(false);
                              setImsakiyeDesign(design);
                            }}
                            className={cn(
                              "h-8 min-w-8 rounded-md px-2.5 text-xs font-extrabold transition-colors",
                              imsakiyeDesign === design
                                ? "bg-brand text-white"
                                : "border border-border bg-white text-ink-soft hover:border-ink/30",
                            )}
                          >
                            {design}
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-[11px] text-ink-soft">
                        1: kartlı geniş · 2: tek satır şerit
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <PanelFormFooter>
        <p className="mr-auto hidden text-sm text-ink-soft sm:block">
          {onCount}/{ALL_KEYS.length} blok açık
          {saved ? " · Kaydedildi" : ""}
        </p>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </PanelFormFooter>
      <p className="text-center text-sm text-ink-soft sm:hidden">
        {onCount}/{ALL_KEYS.length} blok açık
        {saved ? " · Kaydedildi" : ""}
      </p>
    </form>
  );
}
