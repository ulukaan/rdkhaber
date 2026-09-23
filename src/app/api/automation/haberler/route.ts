import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  assertAutomationAuth,
  articleSelect,
  automationUnauthorized,
  createAutomationArticle,
  jsonError,
  jsonOk,
  parseArticleStatus,
  withArticleUrls,
} from "@/lib/automation-api";

export async function GET(request: NextRequest) {
  if (!assertAutomationAuth(request)) return automationUnauthorized();

  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q")?.trim() || "";
    const statusRaw = searchParams.get("status")?.trim();
    const categorySlug = searchParams.get("category")?.trim() || "";
    const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);
    const take = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20) || 20));
    const skip = (page - 1) * take;

    const where: Prisma.ArticleWhereInput = {};
    if (statusRaw) where.status = parseArticleStatus(statusRaw);
    if (categorySlug) where.category = { slug: categorySlug };
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { summary: { contains: q } },
        { slug: { contains: q } },
      ];
    }

    const [total, rows] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip,
        take,
        select: articleSelect,
      }),
    ]);

    return jsonOk({
      page,
      limit: take,
      total,
      articles: rows.map(withArticleUrls),
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Listeleme hatası", 500);
  }
}

export async function POST(request: NextRequest) {
  if (!assertAutomationAuth(request)) return automationUnauthorized();

  try {
    const body = await request.json();
    const article = await createAutomationArticle(body);
    return jsonOk(
      {
        message: "Haber oluşturuldu.",
        article: withArticleUrls(article),
      },
      201,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Oluşturma hatası";
    const status = message.includes("zorunlu") || message.includes("bulunamadı") || message.includes("geçersiz")
      ? 400
      : 500;
    return jsonError(message, status);
  }
}
