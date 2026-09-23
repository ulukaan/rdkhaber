import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  assertAutomationAuth,
  automationUnauthorized,
  jsonError,
  jsonOk,
} from "@/lib/automation-api";

export async function GET(request: NextRequest) {
  if (!assertAutomationAuth(request)) return automationUnauthorized();

  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        order: true,
        _count: { select: { articles: true } },
      },
    });

    return jsonOk({
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        color: c.color,
        order: c.order,
        articleCount: c._count.articles,
      })),
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Listeleme hatası", 500);
  }
}
