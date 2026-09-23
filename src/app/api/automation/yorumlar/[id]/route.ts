import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  assertAutomationAuth,
  automationUnauthorized,
  jsonError,
  jsonOk,
} from "@/lib/automation-api";
import { writeAuditLog } from "@/lib/audit-log";
import { revalidatePublicSite } from "@/lib/revalidate-site";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Ctx) {
  if (!assertAutomationAuth(request)) return automationUnauthorized();

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const action = String(body.action || "").toLowerCase();

    const existing = await prisma.comment.findUnique({
      where: { id },
      select: { id: true, approved: true, articleId: true },
    });
    if (!existing) return jsonError("Yorum bulunamadı.", 404);

    if (action === "delete" || action === "reject") {
      await prisma.comment.delete({ where: { id } });
      await writeAuditLog({
        action: "automation.delete_comment",
        entity: "Comment",
        entityId: id,
        meta: { articleId: existing.articleId },
      });
      revalidatePublicSite();
      return jsonOk({ message: "Yorum silindi.", id });
    }

    const approved =
      typeof body.approved === "boolean"
        ? body.approved
        : action === "approve"
          ? true
          : action === "unapprove"
            ? false
            : null;

    if (approved === null) {
      return jsonError("'action' (approve|unapprove|reject) veya 'approved' (boolean) gerekli.");
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: { approved },
      select: {
        id: true,
        content: true,
        authorName: true,
        approved: true,
        createdAt: true,
        articleId: true,
      },
    });

    await writeAuditLog({
      action: approved ? "automation.approve_comment" : "automation.unapprove_comment",
      entity: "Comment",
      entityId: id,
    });
    revalidatePublicSite();

    return jsonOk({ message: approved ? "Yorum onaylandı." : "Yorum onayı kaldırıldı.", comment });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Güncelleme hatası", 500);
  }
}

export async function DELETE(request: NextRequest, context: Ctx) {
  if (!assertAutomationAuth(request)) return automationUnauthorized();

  try {
    const { id } = await context.params;
    const existing = await prisma.comment.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return jsonError("Yorum bulunamadı.", 404);

    await prisma.comment.delete({ where: { id } });
    await writeAuditLog({
      action: "automation.delete_comment",
      entity: "Comment",
      entityId: id,
    });
    revalidatePublicSite();

    return jsonOk({ message: "Yorum silindi.", id });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Silme hatası", 500);
  }
}
