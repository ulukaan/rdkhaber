"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

export async function listArticleRevisionsAction(articleId: string) {
  await requireRole(["ADMIN", "EDITOR"]);
  const rows = await prisma.articleRevision.findMany({
    where: { articleId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { name: true } } },
  });

  return rows.map((r) => {
    let preview: { title?: string; status?: string } = {};
    try {
      preview = JSON.parse(r.snapshot) as { title?: string; status?: string };
    } catch {
      /* ignore */
    }
    return {
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      userName: r.user.name,
      preview,
    };
  });
}
