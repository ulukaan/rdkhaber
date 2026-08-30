import { NextRequest, NextResponse } from "next/server";
import { getFeedArticles } from "@/lib/articles";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const skip = Math.max(0, Number(searchParams.get("skip") ?? "0") || 0);
  const take = Math.min(12, Math.max(1, Number(searchParams.get("take") ?? "8") || 8));
  const exclude = (searchParams.get("exclude") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const rows = await getFeedArticles(exclude, skip, take);
  return NextResponse.json({
    items: rows.map((a) => ({
      ...a,
      publishedAt: a.publishedAt?.toISOString() ?? null,
    })),
    hasMore: rows.length === take,
  });
}
