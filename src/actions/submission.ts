"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { newsSubmissionSchema } from "@/lib/validation";
import { requireRole } from "@/lib/auth-guard";
import { slugify } from "@/lib/slug";
import { sanitizeArticleHtml } from "@/lib/article-html";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  isImageAttachment,
  isVideoAttachment,
  parseAttachmentUrls,
} from "@/lib/attachments";
import { getSettings } from "@/lib/settings";
import { getSiteUrl } from "@/lib/site-url";
import { sendPanelNotificationEmail } from "@/lib/notify-email";

export async function submitNewsAction(values: {
  title: string;
  content: string;
  submitterName?: string;
  submitterEmail?: string;
  attachmentUrl?: string;
}) {
  const h = await headers();
  const limited = rateLimit(`news-submit:${clientIp(h)}`, { limit: 5, windowMs: 60 * 60_000 });
  if (!limited.ok) {
    return { error: `Çok fazla istek. ${limited.retryAfterSec} sn sonra tekrar deneyin.` };
  }

  const parsed = newsSubmissionSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const session = await auth();

  await prisma.newsSubmission.create({
    data: {
      title: parsed.data.title.slice(0, 300),
      content: sanitizeArticleHtml(parsed.data.content).slice(0, 50_000),
      attachmentUrl: parsed.data.attachmentUrl ?? null,
      submitterId: session?.user?.id,
      submitterName: session?.user?.name ?? (parsed.data.submitterName || null),
      submitterEmail: session?.user?.email ?? (parsed.data.submitterEmail || null),
    },
  });

  const settings = await getSettings();
  const siteUrl = getSiteUrl();
  const submitterName =
    session?.user?.name ?? (parsed.data.submitterName?.trim() || "Belirtilmedi");
  const submitterEmail =
    session?.user?.email ?? (parsed.data.submitterEmail?.trim() || "Belirtilmedi");

  await sendPanelNotificationEmail({
    to: settings.contactEmail,
    subject: `${settings.siteName} — Yeni haber başvurusu`,
    eyebrow: "Haber gönder",
    title: "Yeni haber başvurusu",
    intro: "Sitedeki haber gönder formu üzerinden yeni bir başvuru alındı.",
    fields: [
      { label: "Başlık", value: parsed.data.title.slice(0, 300) },
      { label: "Gönderen", value: submitterName },
      { label: "E-posta", value: submitterEmail },
      ...(parsed.data.attachmentUrl
        ? [{ label: "Ek dosya", value: parseAttachmentUrls(parsed.data.attachmentUrl).join(", ") }]
        : []),
      {
        label: "İçerik",
        value: parsed.data.content.replace(/<[^>]+>/g, " ").slice(0, 2000),
        multiline: true,
      },
    ],
    panelHref: `${siteUrl}/admin/haber-basvurulari`,
  });

  return { success: true };
}

export async function rejectSubmissionAction(id: string) {
  await requireRole(["ADMIN", "EDITOR"]);
  await prisma.newsSubmission.update({ where: { id }, data: { status: "REJECTED" } });
  revalidatePath("/admin/haber-basvurulari");
  revalidatePath("/editor/haber-basvurulari");
}

export async function deleteSubmissionAction(id: string) {
  await requireRole(["ADMIN", "EDITOR"]);
  await prisma.newsSubmission.delete({ where: { id } });
  revalidatePath("/admin/haber-basvurulari");
  revalidatePath("/editor/haber-basvurulari");
}

// Onaylanan başvuru, editörün düzenleyip yayınlayabileceği bir taslak habere dönüştürülür.
export async function approveSubmissionAction(id: string) {
  const session = await requireRole(["ADMIN", "EDITOR"]);

  const submission = await prisma.newsSubmission.findUnique({ where: { id } });
  if (!submission) return { error: "Başvuru bulunamadı." };

  const defaultCategory = await prisma.category.findFirst({ orderBy: { order: "asc" } });
  if (!defaultCategory) return { error: "Önce en az bir kategori oluşturun." };

  const baseSlug = slugify(submission.title);
  let slug = baseSlug;
  let i = 1;
  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  const urls = parseAttachmentUrls(submission.attachmentUrl);
  const coverImageUrl = urls.find(isImageAttachment) ?? null;
  const videoUrl = coverImageUrl ? null : (urls.find(isVideoAttachment) ?? null);
  const used = new Set([coverImageUrl, videoUrl].filter(Boolean));
  const extraLinks = urls
    .filter((u) => !used.has(u))
    .map((u) => `<p><a href="${u}">Ek dosya: ${u.split("/").pop()}</a></p>`)
    .join("");
  const contentHtml = sanitizeArticleHtml(
    submission.content.includes("<")
      ? submission.content
      : `<p>${submission.content.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`,
  );

  const [article] = await prisma.$transaction([
    prisma.article.create({
      data: {
        title: submission.title,
        slug,
        summary: submission.content.replace(/<[^>]+>/g, " ").slice(0, 180),
        content: sanitizeArticleHtml(`${contentHtml}${extraLinks}`),
        coverImageUrl,
        videoUrl,
        status: "DRAFT",
        categoryId: defaultCategory.id,
        authorId: session.user.id,
      },
    }),
    prisma.newsSubmission.update({ where: { id }, data: { status: "APPROVED" } }),
  ]);

  revalidatePath("/admin/haber-basvurulari");
  revalidatePath("/editor/haber-basvurulari");
  revalidatePath("/admin/makaleler");
  revalidatePath("/editor/makaleler");
  return { success: true, articleId: article.id };
}
