import { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { applyWordPairsCounted, replaceInHtmlCounted, type WordPair } from "@/lib/haber-bot/words";
import { fetchSourcePosts } from "@/lib/haber-bot/feed";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export type FetchResult = {
  imported: number;
  skipped: number;
  failed: number;
  error?: string;
};

async function uniqueSlug(base: string) {
  const root = slugify(base) || `haber-${Date.now()}`;
  let slug = root;
  let n = 2;
  while (await prisma.article.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${root}-${n}`;
    n += 1;
  }
  return slug;
}

async function saveCover(url: string | null, uploadedById: string): Promise<string | null> {
  if (!url) return null;
  try {
    const { safeFetch } = await import("@/lib/safe-fetch");
    const { detectUploadMime, isImageMime } = await import("@/lib/upload-safe");
    const res = await safeFetch(url, {
      headers: { Accept: "image/*,*/*" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 32 || buffer.length > 8 * 1024 * 1024) return null;
    const mime = detectUploadMime(buffer);
    if (!mime || !isImageMime(mime)) return null;

    const { saveStaffMedia } = await import("@/lib/media-upload");
    const saved = await saveStaffMedia({
      buffer,
      originalName: `bot-${Date.now()}.jpg`,
      uploadedById,
      subfolder: "bot",
    });
    return saved.url;
  } catch {
    return null;
  }
}

async function loadWords(): Promise<WordPair[]> {
  const rows = await prisma.haberBotWord.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
  return rows.map((row) => ({ find: row.find, replace: row.replace }));
}

export async function runHaberBotSource(sourceId: string, authorId: string): Promise<FetchResult> {
  const source = await prisma.haberBotSource.findUnique({
    where: { id: sourceId },
    include: { category: { select: { id: true } } },
  });
  if (!source) return { imported: 0, skipped: 0, failed: 0, error: "Kaynak bulunamadı." };
  if (!source.enabled) return { imported: 0, skipped: 0, failed: 0, error: "Kaynak kapalı." };

  const words = await loadWords();
  let imported = 0;
  let skipped = 0;
  let failed = 0;

  try {
    const posts = await fetchSourcePosts(source.url, source.maxItems);

    for (const post of posts) {
      try {
        const urlVariants = [post.url, post.url.replace(/\/$/, ""), `${post.url.replace(/\/$/, "")}/`];
        const existing = await prisma.article.findFirst({
          where: { sourceUrl: { in: [...new Set(urlVariants)] } },
          select: { id: true },
        });
        if (existing) {
          skipped += 1;
          await prisma.haberBotLog.create({
            data: {
              sourceId: source.id,
              sourceUrl: post.url,
              title: post.title,
              status: "skipped",
              message: "Bu haber daha önce çekilmiş",
              articleId: existing.id,
            },
          });
          continue;
        }

        const titleResult = applyWordPairsCounted(post.title, words);
        const summaryResult = applyWordPairsCounted(post.summary, words);
        const contentResult = replaceInHtmlCounted(post.content, words);
        const title = titleResult.text.trim();
        const summary = summaryResult.text.trim();
        const content = contentResult.text.trim();
        const wordHits = titleResult.hits + summaryResult.hits + contentResult.hits;
        const wordNote = wordHits > 0 ? `${wordHits} kelime değişti` : "kelime değişmedi";

        const duplicateTitle = await prisma.article.findFirst({
          where: { title },
          select: { id: true },
        });
        if (duplicateTitle) {
          skipped += 1;
          await prisma.haberBotLog.create({
            data: {
              sourceId: source.id,
              sourceUrl: post.url,
              title,
              status: "skipped",
              message: "Aynı başlıkta haber zaten var",
              articleId: duplicateTitle.id,
            },
          });
          continue;
        }

        if (title.length < 5 || content.length < 20) {
          failed += 1;
          await prisma.haberBotLog.create({
            data: {
              sourceId: source.id,
              sourceUrl: post.url,
              title: title || post.title,
              status: "error",
              message: "Başlık veya metin çok kısa",
            },
          });
          continue;
        }

        const status = source.importStatus === "PUBLISHED" ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT;
        const coverImageUrl = await saveCover(post.coverUrl, authorId);
        const article = await prisma.article.create({
          data: {
            title,
            slug: await uniqueSlug(title),
            summary: summary.length >= 10 ? summary : `${title}.`,
            content,
            coverImageUrl,
            status,
            publishedAt: status === ArticleStatus.PUBLISHED ? (post.publishedAt ?? new Date()) : null,
            sourceName: source.name,
            sourceUrl: post.url,
            reporterName: post.author,
            authorId,
            categoryId: source.categoryId,
            extraCategories: { create: { categoryId: source.categoryId } },
          },
        });

        imported += 1;
        await prisma.haberBotLog.create({
          data: {
            sourceId: source.id,
            sourceUrl: post.url,
            title,
            status: "imported",
            message: `${status === ArticleStatus.PUBLISHED ? "Yayınlandı" : "Taslak olarak kaydedildi"} · ${wordNote}`,
            articleId: article.id,
          },
        });
      } catch (err) {
        failed += 1;
        await prisma.haberBotLog.create({
          data: {
            sourceId: source.id,
            sourceUrl: post.url,
            title: post.title,
            status: "error",
            message: err instanceof Error ? err.message : "Kayıt hatası",
          },
        });
      }
    }

    await prisma.haberBotSource.update({
      where: { id: source.id },
      data: { lastFetchedAt: new Date(), lastError: null },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Çekim başarısız";
    await prisma.haberBotSource.update({
      where: { id: source.id },
      data: { lastFetchedAt: new Date(), lastError: message },
    });
    return { imported, skipped, failed, error: message };
  }

  return { imported, skipped, failed };
}

export async function runAllHaberBotSources(authorId: string): Promise<FetchResult> {
  const sources = await prisma.haberBotSource.findMany({
    where: { enabled: true },
    select: { id: true },
  });
  if (sources.length === 0) {
    return { imported: 0, skipped: 0, failed: 0, error: "Aktif kaynak yok." };
  }

  const totals: FetchResult = { imported: 0, skipped: 0, failed: 0 };
  const errors: string[] = [];

  for (const source of sources) {
    const result = await runHaberBotSource(source.id, authorId);
    totals.imported += result.imported;
    totals.skipped += result.skipped;
    totals.failed += result.failed;
    if (result.error) errors.push(result.error);
  }

  if (errors.length) totals.error = errors[0];
  return totals;
}
