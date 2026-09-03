import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveShareCardPhoto } from "@/lib/share-post";
import { renderSharePostImage } from "@/lib/share-post-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: Request, { params }: Params) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      summary: true,
      status: true,
      coverImageUrl: true,
      imageSocial: true,
      imageMainHeadline: true,
      imageFiveHeadline: true,
      headlineSub: true,
      publishedAt: true,
      category: { select: { name: true } },
    },
  });
  if (!article) return new NextResponse("Not found", { status: 404 });

  if (article.status !== "PUBLISHED") {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "EDITOR") {
      return new NextResponse("Not found", { status: 404 });
    }
  }

  const photoUrl = resolveShareCardPhoto(article);

  const image = await renderSharePostImage({
    title: article.title,
    summary: article.summary,
    categoryName: article.category.name,
    publishedAt: article.publishedAt,
    headlineSub: article.headlineSub,
    coverImageUrl: photoUrl,
  });

  const download = new URL(req.url).searchParams.get("indir") === "1";
  const headers = new Headers(image.headers);
  headers.set("Cache-Control", article.status === "PUBLISHED" ? "public, max-age=60" : "private, no-store");
  if (download) {
    headers.set("Content-Disposition", `attachment; filename="duzce-radikal-${slug}.png"`);
  }
  return new NextResponse(image.body, { status: 200, headers });
}
