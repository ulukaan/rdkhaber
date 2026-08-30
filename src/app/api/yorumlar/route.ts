import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const articleId = request.nextUrl.searchParams.get("articleId")?.trim();
  if (!articleId) {
    return NextResponse.json({ items: [] }, { status: 400 });
  }

  const items = await prisma.comment.findMany({
    where: { articleId, approved: true },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      content: true,
      authorName: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    items: items.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
  });
}
