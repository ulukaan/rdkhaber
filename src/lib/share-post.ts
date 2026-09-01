export type SharePostInput = {
  title: string;
  summary: string;
  categoryName: string;
  publishedAt: Date | null;
  headlineSub?: string | null;
};

export type SharePostCopy = {
  dateLabel: string;
  category: string;
  title: string;
  lead: string;
  whyMain: string | null;
  whyWatch: string | null;
};

export function formatSharePostDate(date: Date) {
  const day = new Intl.DateTimeFormat("tr-TR", { day: "numeric" }).format(date);
  const month = new Intl.DateTimeFormat("tr-TR", { month: "long" }).format(date);
  const year = date.getFullYear();
  const weekday = new Intl.DateTimeFormat("tr-TR", { weekday: "long" }).format(date);
  const cap = weekday.charAt(0).toLocaleUpperCase("tr-TR") + weekday.slice(1);
  return `${day} ${month} ${year}, ${cap}`;
}

function sentences(text: string) {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function clip(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function buildSharePostCopy(input: SharePostInput): SharePostCopy {
  const parts = sentences(input.summary);
  const lead = parts[0] ?? input.summary.trim();
  const leftover = parts.slice(1);
  const whyLines = input.headlineSub?.trim()
    ? input.headlineSub
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean)
    : leftover;

  return {
    dateLabel: formatSharePostDate(input.publishedAt ?? new Date()),
    category: input.categoryName.replace(/\s+/g, " ").trim().toLocaleUpperCase("tr-TR"),
    title: clip(input.title.trim(), 110),
    lead: clip(lead, 260),
    whyMain: whyLines[0] ? clip(whyLines[0], 180) : null,
    whyWatch: whyLines[1] ? clip(whyLines[1], 160) : null,
  };
}

export function sharePostPath(slug: string) {
  return `/haber/${encodeURIComponent(slug)}/paylasim`;
}

export function autoShareImagePath(articleId: string) {
  return `/uploads/share/${articleId}.png`;
}
