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
    const { searchParams } = request.nextUrl;
    const approvedParam = searchParams.get("approved");
    const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);
    const take = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 30) || 30));
    const skip = (page - 1) * take;

    const where =
      approvedParam === "true"
        ? { approved: true }
        : approvedParam === "false" || !approvedParam
          ? { approved: false }
          : {};

    const [total, comments] = await Promise.all([
      prisma.comment.count({ where }),
      prisma.comment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          content: true,
          authorName: true,
          authorEmail: true,
          approved: true,
          createdAt: true,
          article: {
            select: { id: true, title: true, slug: true },
          },
        },
      }),
    ]);

    return jsonOk({ page, limit: take, total, comments });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Listeleme hatası", 500);
  }
}
