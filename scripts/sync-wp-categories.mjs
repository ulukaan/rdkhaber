import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SOURCE =
  process.env.IMPORT_SOURCE?.replace(/\/$/, "") ||
  "https://darkslategrey-kudu-152481.hostingersite.com";

const TR = {
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

function slugify(input) {
  const r = String(input).replace(/[çÇğĞıIİöÖşŞüÜ]/g, (c) => TR[c] ?? c);
  return r
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanName(name) {
  let n = String(name)
    .replace(/\s*Yorum Yap Ad veya Rumuz\s*\*?\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (/^b[öo]lge\s*hab/i.test(n)) n = "Bölge Haberleri";
  if (/^s[iİ]yas[iİ]\s*part/i.test(n)) n = "Siyasi Partiler";
  return n;
}

/** Sabit renk paleti — WP'de renk yok; tip + slug'a göre atıyoruz */
const COLOR_BY_SLUG = {
  gundem: "#dc2626",
  siyaset: "#4f46e5",
  ekonomi: "#2563eb",
  spor: "#ea580c",
  saglik: "#0d9488",
  magazin: "#db2777",
  turkiye: "#059669",
  "bolge-kategorileri": "#0f766e",
  bolge: "#0f766e",
  genel: "#64748b",
  "foto-galeri": "#7c3aed",
  "video-galeri": "#9333ea",
  "siyasi-partiler": "#312e81",
  "anahtar-parti": "#e11d48",
  "cumhuriyet-halk-partisi": "#dc2626",
  "adalet-ve-kalkinma-partisi": "#f59e0b",
  "zafer-partisi": "#b45309",
  "iyi-parti": "#0284c7",
  "milliyetci-hareket-partisi": "#b91c1c",
  "saadet-partisi": "#15803d",
  "yeniden-refah-partisi": "#a16207",
  duzce: "#be123c",
  akcakoca: "#0369a1",
  cilimli: "#0e7490",
  cumayeri: "#155e75",
  golyaka: "#166534",
  gumusova: "#3f6212",
  kaynasli: "#854d0e",
  yigilca: "#9a3412",
  beykoy: "#9f1239",
  bolu: "#1d4ed8",
  "duzce-valiligi": "#1e3a8a",
  "duzce-belediyesi": "#1e40af",
  "duzce-ticaret-ve-sanayi-odasi": "#334155",
  "duzce-il-milli-egitim-muduru": "#4338ca",
  "duzce-ataturk-devlet-hastanesi": "#0f766e",
  "duzce-tarim-ve-orman-mudurlugu": "#365314",
};

const PARTY = new Set([
  "anahtar-parti",
  "cumhuriyet-halk-partisi",
  "adalet-ve-kalkinma-partisi",
  "zafer-partisi",
  "iyi-parti",
  "milliyetci-hareket-partisi",
  "saadet-partisi",
  "yeniden-refah-partisi",
]);

const DISTRICT = new Set([
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
]);

const SKIP = new Set(["uncategorized", "genel"]); // genel'i tutabiliriz aslında - keep genel

function colorFor(slug, name) {
  if (COLOR_BY_SLUG[slug]) return COLOR_BY_SLUG[slug];
  if (PARTY.has(slug)) return "#4c1d95";
  if (DISTRICT.has(slug)) return "#0f766e";
  // deterministic pastel from slug
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = h % 360;
  return `hsl(${hue} 65% 40%)`;
}

function orderFor(slug, wpOrderHint) {
  const main = [
    "gundem",
    "siyaset",
    "ekonomi",
    "spor",
    "saglik",
    "magazin",
    "turkiye",
    "bolge-kategorileri",
  ];
  const i = main.indexOf(slug);
  if (i >= 0) return i + 1;
  if (PARTY.has(slug)) return 40;
  if (DISTRICT.has(slug)) return 50;
  return 60 + (wpOrderHint || 0);
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

async function fetchAllPosts() {
  const items = [];
  for (let page = 1; page < 20; page += 1) {
    const batch = await fetchJson(
      `${SOURCE}/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed=1&status=publish`,
    );
    if (!Array.isArray(batch) || batch.length === 0) break;
    items.push(...batch);
    if (batch.length < 100) break;
  }
  return items;
}

function pickBestCategorySlug(terms, catSlugs) {
  const slugs = terms.filter((t) => t.taxonomy === "category").map((t) => t.slug);
  // En spesifik: parti > ilçe > kurum > ana kategori
  for (const s of slugs) if (PARTY.has(s) && catSlugs.has(s)) return s;
  for (const s of slugs) if (DISTRICT.has(s) && catSlugs.has(s)) return s;
  for (const s of [
    "duzce-valiligi",
    "duzce-belediyesi",
    "duzce-ticaret-ve-sanayi-odasi",
    "duzce-il-milli-egitim-muduru",
    "duzce-ataturk-devlet-hastanesi",
    "duzce-tarim-ve-orman-mudurlugu",
  ]) {
    if (slugs.includes(s) && catSlugs.has(s)) return s;
  }
  for (const s of ["spor", "ekonomi", "saglik", "magazin", "siyaset", "turkiye", "gundem"]) {
    if (slugs.includes(s) && catSlugs.has(s)) return s;
  }
  for (const s of slugs) if (catSlugs.has(s) && !SKIP.has(s)) return s;
  return "gundem";
}

async function main() {
  console.log("WP kategorileri çekiliyor…", SOURCE);
  const [wpCats, posts] = await Promise.all([
    fetchJson(`${SOURCE}/wp-json/wp/v2/categories?per_page=100`),
    fetchAllPosts(),
  ]);
  console.log(`${wpCats.length} kategori, ${posts.length} haber`);

  const cleaned = wpCats
    .map((c) => ({
      wpId: c.id,
      parentWpId: c.parent || 0,
      name: cleanName(c.name),
      slug: slugify(c.slug || c.name),
      count: c.count || 0,
    }))
    .filter((c) => c.name && c.slug && c.slug !== "uncategorized");

  // Fix known slug typos from WP
  for (const c of cleaned) {
    if (c.slug.startsWith("duzce-tarim-ve-orman-mudurlugu")) {
      c.slug = "duzce-tarim-ve-orman-mudurlugu";
      c.name = "Düzce Tarım ve Orman Müdürlüğü";
    }
  }

  // Ensure editorial "bolge" alias maps to bolge-kategorileri or create bolge
  if (!cleaned.some((c) => c.slug === "bolge") && cleaned.some((c) => c.slug === "bolge-kategorileri")) {
    // keep bolge-kategorileri as Bölge Habeleri; also upsert display name
  }

  // Upsert categories (parents first)
  const byWpId = new Map(cleaned.map((c) => [c.wpId, c]));
  const idBySlug = new Map();

  const sorted = [...cleaned].sort((a, b) => {
    // parents before children
    if (a.parentWpId === 0 && b.parentWpId !== 0) return -1;
    if (a.parentWpId !== 0 && b.parentWpId === 0) return 1;
    return a.slug.localeCompare(b.slug);
  });

  // First pass: create without parent
  for (const [i, c] of sorted.entries()) {
    const color = colorFor(c.slug, c.name);
    const order = orderFor(c.slug, i);
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        color,
        order,
        photoGallery: c.slug === "foto-galeri",
        videoGallery: c.slug === "video-galeri",
        headingH1: c.name,
        description: null,
      },
      create: {
        name: c.name,
        slug: c.slug,
        color,
        order,
        photoGallery: c.slug === "foto-galeri",
        videoGallery: c.slug === "video-galeri",
        headingH1: c.name,
      },
    });
    idBySlug.set(c.slug, row.id);
    console.log(`+ ${c.name} (${c.slug}) ${color}`);
  }

  // Also keep legacy "bolge" pointing as alias: rename bolge-kategorileri display or upsert bolge
  if (idBySlug.has("bolge-kategorileri") && !idBySlug.has("bolge")) {
    const row = await prisma.category.upsert({
      where: { slug: "bolge" },
      update: {
        name: "Bölge",
        color: COLOR_BY_SLUG.bolge,
        order: 8,
        parentId: null,
      },
      create: {
        name: "Bölge",
        slug: "bolge",
        color: COLOR_BY_SLUG.bolge,
        order: 8,
      },
    });
    idBySlug.set("bolge", row.id);
  }

  // Second pass: set parents
  for (const c of cleaned) {
    if (!c.parentWpId) continue;
    const parent = byWpId.get(c.parentWpId);
    if (!parent) continue;
    const childId = idBySlug.get(c.slug);
    const parentId = idBySlug.get(parent.slug);
    if (!childId || !parentId || childId === parentId) continue;
    await prisma.category.update({
      where: { id: childId },
      data: { parentId },
    });
  }

  // Attach districts under bolge (header /bolge) preferentially
  const bolgeParent =
    idBySlug.get("bolge") || idBySlug.get("bolge-kategorileri") || null;
  if (bolgeParent) {
    for (const slug of DISTRICT) {
      const id = idBySlug.get(slug);
      if (!id) continue;
      await prisma.category.update({
        where: { id },
        data: { parentId: bolgeParent },
      });
    }
    const bolgeKatId = idBySlug.get("bolge-kategorileri");
    if (bolgeKatId && idBySlug.get("bolge") && bolgeKatId !== bolgeParent) {
      await prisma.category.update({
        where: { id: bolgeKatId },
        data: { parentId: bolgeParent, name: "Bölge Haberleri", headingH1: "Bölge Haberleri" },
      });
    }
  }

  // Attach parties under siyasi-partiler or siyaset
  const partyParent = idBySlug.get("siyasi-partiler") || idBySlug.get("siyaset") || null;
  if (partyParent) {
    for (const slug of PARTY) {
      const id = idBySlug.get(slug);
      if (!id) continue;
      await prisma.category.update({
        where: { id },
        data: { parentId: partyParent },
      });
    }
  }

  // Reassign articles to best WP category
  console.log("Haberler kategoriye bağlanıyor…");
  let updated = 0;
  for (const post of posts) {
    const terms = (post._embedded?.["wp:term"] ?? []).flat();
    const best = pickBestCategorySlug(terms, idBySlug);
    const categoryId = idBySlug.get(best) || idBySlug.get("gundem");
    if (!categoryId) continue;
    const title = cleanName(
      String(post.title?.rendered || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    );
    let slug = slugify(post.slug || title) || `haber-${post.id}`;
    const article = await prisma.article.findFirst({
      where: {
        OR: [{ slug }, { sourceUrl: post.link }, { title }],
      },
      select: { id: true, slug: true },
    });
    if (!article) continue;
    await prisma.article.update({
      where: { id: article.id },
      data: { categoryId },
    });
    updated += 1;
  }
  console.log(`${updated} haber güncellendi.`);

  // Header nav: main editorial + Video/Yayın/Burçlar
  const headerSlugs = [
    "gundem",
    "siyaset",
    "ekonomi",
    "spor",
    "saglik",
    "magazin",
    "turkiye",
    "bolge-kategorileri",
  ];
  const headerItems = [];
  let order = 0;
  headerItems.push({ location: "header", label: "Anasayfa", href: "/", visible: true, order: order++ });
  for (const slug of headerSlugs) {
    const cat = cleaned.find((c) => c.slug === slug) || (slug === "bolge-kategorileri" ? { name: "Bölge", slug } : null);
    if (!cat && slug !== "bolge-kategorileri") continue;
    const name =
      slug === "bolge-kategorileri"
        ? "Bölge"
        : cleaned.find((c) => c.slug === slug)?.name || slug;
    const hrefSlug = slug === "bolge-kategorileri" && idBySlug.has("bolge") ? "bolge" : slug;
    if (!idBySlug.has(hrefSlug) && !idBySlug.has(slug)) continue;
    headerItems.push({
      location: "header",
      label: name,
      href: `/${hrefSlug === "bolge-kategorileri" ? "bolge" : hrefSlug}`,
      visible: true,
      order: order++,
    });
  }
  headerItems.push(
    { location: "header", label: "Video", href: "/video-haberler", visible: true, order: order++ },
    { location: "header", label: "Yayın Akışı", href: "/yayin-akisi", visible: true, order: order++ },
    { location: "header", label: "Burçlar", href: "/burclar", visible: true, order: order++ },
  );

  await prisma.navItem.deleteMany({ where: { location: "header" } });
  await prisma.navItem.createMany({ data: headerItems });

  const all = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { name: true, slug: true, color: true, parentId: true },
  });
  console.log(`Toplam kategori: ${all.length}`);
  for (const c of all) {
    console.log(`  ${c.color || "-"}  /${c.slug}  ${c.name}`);
  }
  console.log("Tamam.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
