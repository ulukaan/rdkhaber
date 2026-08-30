import { PrismaClient, ArticleStatus, Role } from "@prisma/client";
import sanitizeHtml from "sanitize-html";

const prisma = new PrismaClient();

const SOURCE =
  process.env.IMPORT_SOURCE?.replace(/\/$/, "") ||
  "https://darkslategrey-kudu-152481.hostingersite.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const TR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  I: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

function slugify(input: string) {
  const replaced = input.replace(/[çÇğĞıIİöÖşŞüÜ]/g, (ch) => TR_MAP[ch] ?? ch);
  return replaced
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type WpTerm = { id: number; name: string; slug: string; taxonomy: string };
type WpPost = {
  id: number;
  slug: string;
  date: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  categories: number[];
  _embedded?: {
    author?: Array<{ name?: string }>;
    "wp:featuredmedia"?: Array<{ source_url?: string }>;
    "wp:term"?: WpTerm[][];
  };
};

type WpCategory = { id: number; name: string; slug: string; count: number };

const EDITORIAL: Array<{
  name: string;
  slug: string;
  color: string;
  order: number;
  description: string;
}> = [
  {
    name: "Gündem",
    slug: "gundem",
    color: "#dc2626",
    order: 1,
    description: "Düzce ve Türkiye'den güncel gelişmeler.",
  },
  {
    name: "Siyaset",
    slug: "siyaset",
    color: "#4f46e5",
    order: 2,
    description: "Parti, meclis ve yerel siyaset haberleri.",
  },
  {
    name: "Ekonomi",
    slug: "ekonomi",
    color: "#2563eb",
    order: 3,
    description: "Ekonomi, ticaret ve iş dünyası.",
  },
  {
    name: "Spor",
    slug: "spor",
    color: "#ea580c",
    order: 4,
    description: "Yerel ve ulusal spor haberleri.",
  },
  {
    name: "Sağlık",
    slug: "saglik",
    color: "#0d9488",
    order: 5,
    description: "Sağlık ve yaşam haberleri.",
  },
  {
    name: "Magazin",
    slug: "magazin",
    color: "#db2777",
    order: 6,
    description: "Magazin ve kültür haberleri.",
  },
  {
    name: "Türkiye",
    slug: "turkiye",
    color: "#059669",
    order: 7,
    description: "Türkiye genelinden haberler.",
  },
  {
    name: "Bölge",
    slug: "bolge",
    color: "#0f766e",
    order: 8,
    description: "Düzce ilçeleri ve çevre il haberleri.",
  },
];

const PARTY_SLUGS = new Set([
  "anahtar-parti",
  "cumhuriyet-halk-partisi",
  "adalet-ve-kalkinma-partisi",
  "zafer-partisi",
  "iyi-parti",
  "milliyetci-hareket-partisi",
  "saadet-partisi",
  "yeniden-refah-partisi",
  "siyasi-partiler",
]);

const DISTRICT_SLUGS = new Set([
  "duzce",
  "akcakoca",
  "cilimli",
  "cumayeri",
  "golyaka",
  "gumusova",
  "kaynasli",
  "yigilca",
  "beykoy",
  "bolu",
  "bolge-kategorileri",
]);

const SKIP_TAG_SLUGS = new Set([
  "genel",
  "foto-galeri",
  "video-galeri",
  "siyasi-partiler",
  "gundem",
  "siyaset",
  "ekonomi",
  "spor",
  "saglik",
  "magazin",
  "turkiye",
  "bolge-kategorileri",
]);

function cleanCategoryName(name: string) {
  return name
    .replace(/\s*Yorum Yap Ad veya Rumuz\s*\*?\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pickPrimarySlug(terms: WpTerm[]): string {
  const slugs = terms.filter((t) => t.taxonomy === "category").map((t) => t.slug);
  if (slugs.includes("spor")) return "spor";
  if (slugs.includes("ekonomi")) return "ekonomi";
  if (slugs.includes("saglik")) return "saglik";
  if (slugs.includes("magazin")) return "magazin";
  if (slugs.includes("siyaset") || slugs.some((s) => PARTY_SLUGS.has(s))) return "siyaset";
  if (slugs.includes("turkiye")) return "turkiye";
  if (slugs.includes("gundem")) return "gundem";
  if (slugs.some((s) => DISTRICT_SLUGS.has(s))) return "bolge";
  return "gundem";
}

function decodeText(html: string) {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}

function toSummary(excerptHtml: string, contentHtml: string) {
  const fromExcerpt = decodeText(excerptHtml);
  if (fromExcerpt.length > 40) {
    return fromExcerpt.length > 360 ? `${fromExcerpt.slice(0, 357).trim()}…` : fromExcerpt;
  }
  const fromBody = decodeText(contentHtml);
  return fromBody.length > 360 ? `${fromBody.slice(0, 357).trim()}…` : fromBody || "Haber özeti";
}

function cleanContent(html: string) {
  const withoutJunk = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  return sanitizeHtml(withoutJunk, {
    allowedTags: [
      "p",
      "h2",
      "h3",
      "h4",
      "blockquote",
      "strong",
      "b",
      "em",
      "i",
      "ul",
      "ol",
      "li",
      "a",
      "br",
      "img",
      "figure",
      "figcaption",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
      img: (tagName, attribs) => {
        const src = attribs.src?.startsWith("//")
          ? `https:${attribs.src}`
          : attribs.src?.startsWith("/")
            ? `${SOURCE}${attribs.src}`
            : attribs.src;
        return {
          tagName,
          attribs: {
            src: src ?? "",
            alt: attribs.alt ?? "",
          },
        };
      },
    },
  });
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return (await res.json()) as T;
}

async function fetchAllPosts(): Promise<WpPost[]> {
  const items: WpPost[] = [];
  for (let page = 1; page < 50; page += 1) {
    const batch = await fetchJson<WpPost[]>(
      `${SOURCE}/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed=1&status=publish`,
    );
    if (!Array.isArray(batch) || batch.length === 0) break;
    items.push(...batch);
    if (batch.length < 100) break;
  }
  return items;
}

async function ensureCategories() {
  const map = new Map<string, string>();
  for (const cat of EDITORIAL) {
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, color: cat.color, order: cat.order, description: cat.description },
      create: cat,
    });
    map.set(cat.slug, row.id);
  }
  return map;
}

async function ensureTag(name: string) {
  const cleaned = cleanCategoryName(name);
  if (!cleaned) return null;
  const slug = slugify(cleaned);
  if (!slug || SKIP_TAG_SLUGS.has(slug)) return null;
  const row = await prisma.tag.upsert({
    where: { slug },
    update: { name: cleaned },
    create: { name: cleaned, slug },
  });
  return row.id;
}

async function main() {
  console.log("Canlı siteden haberler çekiliyor…");
  const [posts, wpCats] = await Promise.all([
    fetchAllPosts(),
    fetchJson<WpCategory[]>(`${SOURCE}/wp-json/wp/v2/categories?per_page=100`),
  ]);
  console.log(`${posts.length} haber, ${wpCats.length} WP kategorisi.`);

  const author =
    (await prisma.user.findFirst({ where: { role: Role.ADMIN } })) ??
    (await prisma.user.findFirst());
  if (!author) {
    throw new Error("Veritabanında kullanıcı yok. Önce `npx prisma db seed` çalıştırın.");
  }

  const catMap = await ensureCategories();
  await prisma.category.updateMany({
    where: { slug: { notIn: EDITORIAL.map((c) => c.slug) } },
    data: { order: 99 },
  });
  const defaultCatId = catMap.get("gundem");
  if (!defaultCatId) throw new Error("Gündem kategorisi oluşturulamadı.");

  console.log("Eski örnek haberler siliniyor…");
  await prisma.article.deleteMany();

  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  let created = 0;
  const usedSlugs = new Set<string>();

  for (const [index, post] of sorted.entries()) {
    const terms = (post._embedded?.["wp:term"] ?? []).flat();
    const catTerms = terms.filter((t) => t.taxonomy === "category");
    const primary = pickPrimarySlug(catTerms);
    const categoryId = catMap.get(primary) ?? defaultCatId;
    const cover = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;
    const title = decodeText(post.title.rendered);
    let slug = slugify(post.slug || title) || `haber-${post.id}`;
    if (usedSlugs.has(slug)) slug = `${slug}-${post.id}`;
    usedSlugs.add(slug);

    const tagIds: string[] = [];
    const districtCount = catTerms.filter((t) => DISTRICT_SLUGS.has(t.slug)).length;
    for (const term of catTerms) {
      if (term.slug === primary) continue;
      if (districtCount > 4 && DISTRICT_SLUGS.has(term.slug)) continue;
      const tagId = await ensureTag(term.name);
      if (tagId && !tagIds.includes(tagId)) tagIds.push(tagId);
    }

    const reporter =
      post._embedded?.author?.[0]?.name &&
      post._embedded.author[0].name.toLowerCase() !== "duzceradikal"
        ? post._embedded.author[0].name
        : "Düzce Radikal";

    await prisma.article.create({
      data: {
        title,
        slug,
        summary: toSummary(post.excerpt.rendered, post.content.rendered),
        content: cleanContent(post.content.rendered),
        coverImageUrl: cover,
        status: ArticleStatus.PUBLISHED,
        isBreaking: index === 0,
        isFeatured: index < 3,
        inFiveHeadline: index >= 1 && index < 6,
        inSpotlight: index >= 3 && index < 10,
        sourceName: "Düzce Radikal",
        sourceUrl: post.link,
        reporterName: reporter,
        publishedAt: new Date(post.date),
        authorId: author.id,
        categoryId,
        tags: tagIds.length ? { connect: tagIds.map((id) => ({ id })) } : undefined,
      },
    });
    created += 1;
    if (created % 10 === 0) console.log(`  ${created}/${sorted.length}`);
  }

  const headerCats = EDITORIAL.map((c) => ({
    label: c.name,
    href: `/${c.slug}`,
    visible: true,
  }));
  await prisma.navItem.deleteMany({ where: { location: "header" } });
  await prisma.navItem.createMany({
    data: [
      { location: "header", label: "Anasayfa", href: "/", visible: true, order: 0 },
      ...headerCats.map((item, i) => ({ location: "header", ...item, order: i + 1 })),
      {
        location: "header",
        label: "Video",
        href: "/video-haberler",
        visible: true,
        order: headerCats.length + 1,
      },
      {
        location: "header",
        label: "Yayın Akışı",
        href: "/yayin-akisi",
        visible: true,
        order: headerCats.length + 2,
      },
      {
        location: "header",
        label: "Burçlar",
        href: "/burclar",
        visible: true,
        order: headerCats.length + 3,
      },
    ],
  });

  const counts = await prisma.article.groupBy({
    by: ["categoryId"],
    _count: true,
  });
  const cats = await prisma.category.findMany({ select: { id: true, name: true } });
  const byId = Object.fromEntries(cats.map((c) => [c.id, c.name]));
  console.log("Kategori dağılımı:");
  for (const row of counts.sort((a, b) => b._count - a._count)) {
    console.log(`  ${byId[row.categoryId] ?? row.categoryId}: ${row._count}`);
  }
  console.log(`Tamam: ${created} haber yüklendi.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
