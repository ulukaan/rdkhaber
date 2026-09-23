import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  assertAutomationAuth,
  articleSelect,
  automationUnauthorized,
  jsonError,
  jsonOk,
  updateAutomationArticle,
  withArticleUrls,
} from "@/lib/automation-api";
import { writeAuditLog } from "@/lib/audit-log";
import { revalidatePublicSite } from "@/lib/revalidate-site";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Ctx) {
  if (!assertAutomationAuth(request)) return automationUnauthorized();

  try {
    const { id } = await context.params;
    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        ...articleSelect,
        content: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        reporterName: true,
        videoUrl: true,
        videoEmbed: true,
      },
    });
    if (!article) return jsonError("Haber bulunamadı.", 404);
    return jsonOk({ article: withArticleUrls(article) });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Okuma hatası", 500);
  }
}

export async function PATCH(request: NextRequest, context: Ctx) {
  if (!assertAutomationAuth(request)) return automationUnauthorized();

  try {
    const { id } = await context.params;
    const body = await request.json();
    const article = await updateAutomationArticle(id, body);
    return jsonOk({ message: "Haber güncellendi.", article: withArticleUrls(article) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Güncelleme hatası";
    if (message.includes("Haber bulunamadı")) return jsonError(message, 404);
    const status = message.includes("bulunamadı") || message.includes("geçersiz") ? 400 : 500;
    return jsonError(message, status);
  }
}

export async function DELETE(request: NextRequest, context: Ctx) {
  if (!assertAutomationAuth(request)) return automationUnauthorized();

  try {
    const { id } = await context.params;
    const existing = await prisma.article.findUnique({
      where: { id },
      select: { id: true, title: true, slug: true },
    });
    if (!existing) return jsonError("Haber bulunamadı.", 404);

    await prisma.article.delete({ where: { id } });
    await writeAuditLog({
      action: "automation.delete_article",
      entity: "Article",
      entityId: id,
      meta: { title: existing.title, slug: existing.slug },
    });
    revalidatePublicSite();

    return jsonOk({ message: "Haber silindi.", id });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Silme hatası", 500);
  }
}
