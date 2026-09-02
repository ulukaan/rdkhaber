import { cache } from "react";
import { getSettings } from "@/lib/settings";

const TV_BASE = "https://www.hurriyet.com.tr/tv-rehberi/yayin-akisi";
const LOGO_BASE = "https://static.hurriyet.com.tr/static-image/common/tv-rehberi/channel-logo";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const REVALIDATE = 180;
const FETCH_TIMEOUT_MS = 12000;
const HOME_CONCURRENCY = 4;

export type BroadcastStatus = "CANLI" | "TEKRAR" | "YAKINDA";

export type TvChannel = {
  id: number;
  order: number;
  slug: string;
  name: string;
  /** true ise panelde varsayılan seçili */
  featured?: boolean;
  /** Kaynak 5xx / boş döndürüyorsa atlanır */
  disabled?: boolean;
};

/** Ulusal / popüler kanallar — TV rehberi path yapısı */
export const TV_CHANNELS: TvChannel[] = [
  { id: 94, order: 0, slug: "kanal-d", name: "Kanal D", featured: true },
  { id: 20, order: 1, slug: "cnn-turk", name: "CNN Türk", featured: true },
  { id: 90, order: 2, slug: "star-tv", name: "Star TV", featured: true },
  { id: 92, order: 3, slug: "show-tv", name: "Show TV", featured: true },
  { id: 83, order: 4, slug: "atv", name: "ATV", featured: true },
  { id: 15, order: 5, slug: "trt-1", name: "TRT 1", featured: true },
  { id: 87, order: 6, slug: "now", name: "NOW", featured: true },
  { id: 24, order: 7, slug: "tv8", name: "TV8", featured: true },
  { id: 30, order: 8, slug: "360", name: "360", featured: true },
  { id: 295, order: 9, slug: "bloomberg-ht", name: "Bloomberg HT", featured: true },
  { id: 365, order: 10, slug: "a-haber", name: "A Haber", featured: true },
  { id: 95, order: 11, slug: "kanal-7", name: "Kanal 7" },
  { id: 105, order: 12, slug: "24-tv", name: "24 TV" },
  { id: 132, order: 13, slug: "tv2", name: "TV2" },
  { id: 22, order: 14, slug: "haberturk", name: "Habertürk", featured: true },
  { id: 321, order: 15, slug: "beyaz-tv", name: "Beyaz TV" },
  { id: 383, order: 16, slug: "animal-planet", name: "Animal Planet", disabled: true },
  { id: 306, order: 17, slug: "nat-geo-people", name: "Nat Geo People", disabled: true },
  { id: 196, order: 18, slug: "snema-tv", name: "Sinema TV" },
  { id: 66, order: 19, slug: "eurosport-1", name: "Eurosport 1" },
  { id: 165, order: 20, slug: "eurosport-2-int", name: "Eurosport 2" },
  { id: 17, order: 21, slug: "trt-3-spor", name: "TRT Spor", featured: true },
  { id: 126, order: 22, slug: "national-geographic", name: "National Geographic" },
  { id: 49, order: 23, slug: "bein-sports-1", name: "beIN Sports 1" },
  { id: 329, order: 24, slug: "sports-tv", name: "Sports TV" },
  { id: 1754, order: 25, slug: "tlc", name: "TLC" },
  { id: 21, order: 26, slug: "ntv", name: "NTV", featured: true },
  { id: 52, order: 27, slug: "a-spor", name: "A Spor", disabled: true },
  { id: 132, order: 28, slug: "teve2", name: "teve2", disabled: true },
  { id: 368, order: 29, slug: "bein-sports-3", name: "beIN Sports 3" },
  { id: 1900, order: 30, slug: "dmax", name: "DMAX" },
  { id: 146, order: 31, slug: "cartoon-network", name: "Cartoon Network" },
  { id: 285, order: 32, slug: "trt-belgesel", name: "TRT Belgesel" },
  { id: 333, order: 33, slug: "disney-junior", name: "Disney Junior" },
];

export type TvProgram = {
  time: string;
  title: string;
  imageUrl: string | null;
  startMin: number;
  /** Absolute end minutes; may be > 1440 when program crosses midnight */
  endMin: number;
};

export type BroadcastItem = {
  id: string;
  time: string;
  endTime: string;
  title: string;
  channel: string;
  channelSlug: string;
  href: string;
  imageUrl: string | null;
  logoUrl: string;
  color: string | null;
  status: BroadcastStatus;
  startMin: number;
  endMin: number;
  /** Programın ait olduğu gün (Europe/Istanbul, YYYY-MM-DD) */
  date: string;
};

export type ChannelSchedule = {
  channel: TvChannel;
  logoUrl: string;
  date: string;
  programs: TvProgram[];
  current: BroadcastItem | null;
};

function decodeHtml(raw: string) {
  return raw
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function absUrl(src: string | undefined | null) {
  if (!src) return null;
  if (src.startsWith("//")) return `https:${src}`;
  if (src.startsWith("http")) return src;
  return `https://static.hurriyet.com.tr${src.startsWith("/") ? "" : "/"}${src}`;
}

function minutesOf(time: string) {
  const [h, m] = time.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

function formatClock(min: number) {
  const normalized = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function istanbulNowMinutes() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

function istanbulToday() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
}

function addDaysIso(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function channelUrl(channel: TvChannel) {
  return `${TV_BASE}/${channel.id}/${channel.order}/${channel.slug}/`;
}

export function channelLogoUrl(channelId: number) {
  return `${LOGO_BASE}/${channelId}.png`;
}

/** nowAbs: minutes since midnight (İstanbul). scheduleDate varsa günler arası doğru hesaplanır. */
export function statusForRange(
  startMin: number,
  endMin: number,
  now?: number,
  scheduleDate?: string,
): BroadcastStatus {
  const nowMin = now ?? istanbulNowMinutes();
  const today = istanbulToday();
  if (scheduleDate && scheduleDate > today) return "YAKINDA";
  if (scheduleDate && scheduleDate < today) return "TEKRAR";
  if (nowMin >= startMin && nowMin < endMin) return "CANLI";
  if (nowMin < startMin) return "YAKINDA";
  return "TEKRAR";
}

function withEnds(programs: Array<{ time: string; title: string; imageUrl: string | null }>): TvProgram[] {
  const sorted = [...programs].sort((a, b) => minutesOf(a.time) - minutesOf(b.time));
  return sorted.map((program, i) => {
    const startMin = minutesOf(program.time);
    const next = sorted[i + 1];
    const nextStart = next ? minutesOf(next.time) : null;
    const endMin =
      nextStart != null && nextStart > startMin
        ? nextStart
        : Math.min(startMin + 90, 1440);
    return { ...program, startMin, endMin };
  });
}

function parseProgramBlock(block: string) {
  const time = block.match(/flow-card_time">\s*([^<]+?)\s*</)?.[1]?.trim();
  const titleRaw = block.match(/flow-card_title">\s*([\s\S]*?)\s*</)?.[1];
  const img =
    block.match(/data-img-src="([^"]+)"/)?.[1] ||
    block.match(/flow-card_img[^>]*src="([^"]+)"/)?.[1];
  if (!time || !titleRaw) return null;
  return {
    time,
    title: decodeHtml(titleRaw),
    imageUrl: absUrl(img),
  };
}

/** Tüm günleri parse eder; aktif günü şu ana göre seçer. */
function parseChannelHtml(html: string, preferredDate: string, now = istanbulNowMinutes()) {
  const blocks = [
    ...html.matchAll(/<li[^>]*class="[^"]*channel-flow_list-item[^"]*"[^>]*>[\s\S]*?<\/li>/gi),
  ];

  const byDate = new Map<string, Array<{ time: string; title: string; imageUrl: string | null }>>();
  for (const m of blocks) {
    const block = m[0];
    const date = block.match(/data-filter-date="(\d{4}-\d{2}-\d{2})"/)?.[1];
    if (!date) continue;
    const program = parseProgramBlock(block);
    if (!program) continue;
    const list = byDate.get(date) ?? [];
    list.push(program);
    byDate.set(date, list);
  }

  const dates = [...byDate.keys()].sort();
  if (dates.length === 0) {
    return { date: preferredDate, programs: [] as TvProgram[] };
  }

  const todayPrograms = withEnds(byDate.get(preferredDate) ?? []);
  const hasLive = todayPrograms.some((p) => statusForRange(p.startMin, p.endMin, now) === "CANLI");
  const hasUpcoming = todayPrograms.some((p) => p.startMin > now);

  let date = preferredDate;
  if (!hasLive && !hasUpcoming) {
    const next =
      dates.find((d) => d > preferredDate) ??
      (dates.includes(addDaysIso(preferredDate, 1)) ? addDaysIso(preferredDate, 1) : null);
    if (next && (byDate.get(next)?.length ?? 0) > 0) {
      date = next;
    } else if (!dates.includes(preferredDate)) {
      date = dates.find((d) => d >= preferredDate) ?? dates[dates.length - 1]!;
    }
  } else if (!dates.includes(preferredDate)) {
    date = dates.find((d) => d >= preferredDate) ?? dates[0]!;
  }

  const programs = withEnds(byDate.get(date) ?? []);
  return { date, programs };
}

function toBroadcastItem(
  channel: TvChannel,
  program: TvProgram,
  scheduleDate: string,
  now = istanbulNowMinutes(),
): BroadcastItem {
  return {
    id: `${channel.slug}-${scheduleDate}-${program.time}-${program.startMin}`,
    time: program.time,
    endTime: formatClock(program.endMin),
    title: program.title,
    channel: channel.name,
    channelSlug: channel.slug,
    href: `/yayin-akisi?kanal=${channel.slug}`,
    imageUrl: program.imageUrl,
    logoUrl: channelLogoUrl(channel.id),
    color: null,
    status: statusForRange(program.startMin, program.endMin, now, scheduleDate),
    startMin: program.startMin,
    endMin: program.endMin,
    date: scheduleDate,
  };
}

function pickCurrent(
  channel: TvChannel,
  programs: TvProgram[],
  scheduleDate: string,
  now = istanbulNowMinutes(),
) {
  if (programs.length === 0) return null;
  const today = istanbulToday();

  if (scheduleDate > today) {
    return toBroadcastItem(channel, programs[0]!, scheduleDate, now);
  }

  if (scheduleDate < today) {
    return toBroadcastItem(channel, programs[programs.length - 1]!, scheduleDate, now);
  }

  const live = programs.find(
    (p) => statusForRange(p.startMin, p.endMin, now, scheduleDate) === "CANLI",
  );
  if (live) return toBroadcastItem(channel, live, scheduleDate, now);
  const upcoming = programs.find((p) => p.startMin > now);
  if (upcoming) return toBroadcastItem(channel, upcoming, scheduleDate, now);
  return toBroadcastItem(channel, programs[programs.length - 1]!, scheduleDate, now);
}

async function fetchHtml(url: string, timeoutMs: number) {
  const res = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
      "User-Agent": UA,
      "Cache-Control": "no-cache",
    },
    next: { revalidate: REVALIDATE },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function fetchChannelSchedule(
  channel: TvChannel,
  timeoutMs = FETCH_TIMEOUT_MS,
): Promise<ChannelSchedule | null> {
  if (channel.disabled) return null;
  const url = channelUrl(channel);
  let html: string | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      html = await fetchHtml(url, timeoutMs);
      break;
    } catch {
      if (attempt === 1) return null;
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  if (!html || !html.includes("channel-flow")) return null;

  const now = istanbulNowMinutes();
  const { date, programs } = parseChannelHtml(html, istanbulToday(), now);
  if (programs.length === 0) return null;

  return {
    channel,
    logoUrl: channelLogoUrl(channel.id),
    date,
    programs,
    current: pickCurrent(channel, programs, date, now),
  };
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next;
      next += 1;
      results[i] = await fn(items[i]!);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

/** Boş liste = featured kanallar. Aksi halde slug sırası korunur. */
export function resolveChannels(slugList: string): TvChannel[] {
  const slugs = slugList
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (slugs.length === 0) {
    return TV_CHANNELS.filter((c) => c.featured && !c.disabled);
  }
  const bySlug = new Map(TV_CHANNELS.map((c) => [c.slug, c]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((c): c is TvChannel => c != null && !c.disabled);
}

/** Anasayfa şeridi: her kanaldan şu an / sıradaki program. */
export const getBroadcastItems = cache(
  async (opts?: { limit?: number }): Promise<BroadcastItem[]> => {
    const settings = await getSettings();
    const channels = resolveChannels(settings.tvChannelSlugs);
    const limited =
      typeof opts?.limit === "number" && opts.limit > 0
        ? channels.slice(0, opts.limit)
        : channels;
    const schedules = await mapPool(limited, HOME_CONCURRENCY, (ch) =>
      fetchChannelSchedule(ch, FETCH_TIMEOUT_MS),
    );
    return schedules
      .map((s) => s?.current ?? null)
      .filter((item): item is BroadcastItem => Boolean(item));
  },
);

/** Tam yayın akışı sayfası. */
export const getTvSchedules = cache(async (): Promise<ChannelSchedule[]> => {
  const settings = await getSettings();
  const channels = resolveChannels(settings.tvChannelSlugs);
  const schedules = await mapPool(channels, HOME_CONCURRENCY, (ch) =>
    fetchChannelSchedule(ch, FETCH_TIMEOUT_MS),
  );
  return schedules.filter((s): s is ChannelSchedule => s != null && s.programs.length > 0);
});
