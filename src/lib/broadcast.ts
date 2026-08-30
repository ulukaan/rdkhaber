import { cache } from "react";
import { getSettings } from "@/lib/settings";

const TV_BASE = "https://www.hurriyet.com.tr/tv-rehberi/yayin-akisi";
const LOGO_BASE = "https://static.hurriyet.com.tr/static-image/common/tv-rehberi/channel-logo";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const REVALIDATE = 300;

export type BroadcastStatus = "CANLI" | "TEKRAR" | "YAKINDA";

export type TvChannel = {
  id: number;
  order: number;
  slug: string;
  name: string;
  /** true ise panelde varsayılan seçili */
  featured?: boolean;
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
  { id: 30, order: 8, slug: "360", name: "360" },
  { id: 295, order: 9, slug: "bloomberg-ht", name: "Bloomberg HT", featured: true },
  { id: 365, order: 10, slug: "a-haber", name: "A Haber", featured: true },
  { id: 95, order: 11, slug: "kanal-7", name: "Kanal 7" },
  { id: 105, order: 12, slug: "24-tv", name: "24 TV" },
  { id: 132, order: 13, slug: "tv2", name: "TV2" },
  { id: 22, order: 14, slug: "haberturk", name: "Habertürk", featured: true },
  { id: 321, order: 15, slug: "beyaz-tv", name: "Beyaz TV" },
  { id: 383, order: 16, slug: "animal-planet", name: "Animal Planet" },
  { id: 306, order: 17, slug: "nat-geo-people", name: "Nat Geo People" },
  { id: 196, order: 18, slug: "snema-tv", name: "Sinema TV" },
  { id: 66, order: 19, slug: "eurosport-1", name: "Eurosport 1" },
  { id: 165, order: 20, slug: "eurosport-2-int", name: "Eurosport 2" },
  { id: 17, order: 21, slug: "trt-3-spor", name: "TRT Spor" },
  { id: 126, order: 22, slug: "national-geographic", name: "National Geographic" },
  { id: 49, order: 23, slug: "bein-sports-1", name: "beIN Sports 1" },
  { id: 329, order: 24, slug: "sports-tv", name: "Sports TV" },
  { id: 1754, order: 25, slug: "tlc", name: "TLC" },
  { id: 21, order: 26, slug: "ntv", name: "NTV", featured: true },
  { id: 52, order: 27, slug: "a-spor", name: "A Spor" },
  { id: 132, order: 28, slug: "teve2", name: "teve2" },
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

function channelUrl(channel: TvChannel) {
  return `${TV_BASE}/${channel.id}/${channel.order}/${channel.slug}/`;
}

export function channelLogoUrl(channelId: number) {
  return `${LOGO_BASE}/${channelId}.png`;
}

/** nowAbs: minutes since midnight */
export function statusForRange(startMin: number, endMin: number, now = istanbulNowMinutes()): BroadcastStatus {
  if (now >= startMin && now < endMin) return "CANLI";
  if (now < startMin) return "YAKINDA";
  return "TEKRAR";
}

function withEnds(programs: Array<{ time: string; title: string; imageUrl: string | null }>): TvProgram[] {
  const sorted = [...programs].sort((a, b) => minutesOf(a.time) - minutesOf(b.time));
  return sorted.map((program, i) => {
    const startMin = minutesOf(program.time);
    const next = sorted[i + 1];
    const nextStart = next ? minutesOf(next.time) : null;
    const endMin =
      nextStart != null && nextStart > startMin ? nextStart : Math.min(startMin + 60, 1440);
    return { ...program, startMin, endMin };
  });
}

function parseChannelHtml(html: string, preferredDate: string) {
  const dates = [...html.matchAll(/data-filter-date="(\d{4}-\d{2}-\d{2})"/g)].map((m) => m[1]);
  const uniqueDates = [...new Set(dates)];
  const date = uniqueDates.includes(preferredDate)
    ? preferredDate
    : (uniqueDates.find((d) => d >= preferredDate) ?? uniqueDates[0] ?? preferredDate);

  const items = [...html.matchAll(/<li([^>]*)class="channel-flow_list-item"([\s\S]*?)<\/li>/g)].filter((m) =>
    m[0].includes(`data-filter-date="${date}"`),
  );

  const programs = items
    .map((m) => {
      const block = m[0];
      const time = block.match(/flow-card_time">\s*([^<]+?)\s*</)?.[1]?.trim();
      const titleRaw = block.match(/flow-card_title">\s*([\s\S]*?)\s*</)?.[1];
      const img = block.match(/data-img-src="([^"]+)"/)?.[1];
      if (!time || !titleRaw) return null;
      return {
        time,
        title: decodeHtml(titleRaw),
        imageUrl: absUrl(img),
      };
    })
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return { date, programs: withEnds(programs) };
}

function toBroadcastItem(
  channel: TvChannel,
  program: TvProgram,
  now = istanbulNowMinutes(),
): BroadcastItem {
  return {
    id: `${channel.slug}-${program.time}`,
    time: program.time,
    endTime: formatClock(program.endMin),
    title: program.title,
    channel: channel.name,
    channelSlug: channel.slug,
    href: `/yayin-akisi?kanal=${channel.slug}`,
    imageUrl: program.imageUrl,
    logoUrl: channelLogoUrl(channel.id),
    color: null,
    status: statusForRange(program.startMin, program.endMin, now),
    startMin: program.startMin,
    endMin: program.endMin,
  };
}

function pickCurrent(channel: TvChannel, programs: TvProgram[], now = istanbulNowMinutes()) {
  if (programs.length === 0) return null;
  const live = programs.find((p) => statusForRange(p.startMin, p.endMin, now) === "CANLI");
  if (live) return toBroadcastItem(channel, live, now);
  const upcoming = programs.find((p) => p.startMin > now);
  if (upcoming) return toBroadcastItem(channel, upcoming, now);
  return toBroadcastItem(channel, programs[programs.length - 1]!, now);
}

async function fetchChannelSchedule(
  channel: TvChannel,
  timeoutMs = 10000,
): Promise<ChannelSchedule | null> {
  try {
    const res = await fetch(channelUrl(channel), {
      headers: { Accept: "text/html", "User-Agent": UA },
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const { date, programs } = parseChannelHtml(html, istanbulToday());
    return {
      channel,
      logoUrl: channelLogoUrl(channel.id),
      date,
      programs,
      current: pickCurrent(channel, programs),
    };
  } catch {
    return null;
  }
}

/** Boş liste = featured kanallar. Aksi halde slug sırası korunur. */
export function resolveChannels(slugList: string): TvChannel[] {
  const slugs = slugList
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (slugs.length === 0) {
    return TV_CHANNELS.filter((c) => c.featured);
  }
  const bySlug = new Map(TV_CHANNELS.map((c) => [c.slug, c]));
  return slugs.map((slug) => bySlug.get(slug)).filter((c): c is TvChannel => Boolean(c));
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
    const schedules = await Promise.all(
      limited.map((ch) => fetchChannelSchedule(ch, 3500)),
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
  const schedules = await Promise.all(channels.map((ch) => fetchChannelSchedule(ch)));
  return schedules.filter((s): s is ChannelSchedule => Boolean(s));
});
