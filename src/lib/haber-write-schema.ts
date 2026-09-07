import { z } from "zod";

/** Dış yazma API gövdesi — Türkçe alan adları (İngilizce alias destekli). */
export const haberWriteSchema = z
  .object({
    baslik: z.string().min(5, "Başlık en az 5 karakter olmalı").optional(),
    title: z.string().min(5).optional(),
    spot: z.string().min(10, "Spot en az 10 karakter olmalı").optional(),
    summary: z.string().min(10).optional(),
    icerik: z.string().min(20, "İçerik en az 20 karakter olmalı").optional(),
    content: z.string().min(20).optional(),
    kategori: z.string().min(1, "Kategori gerekli").optional(),
    category: z.string().min(1).optional(),
    etiketler: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    durum: z.enum(["taslak", "inceleme", "yayinda"]).optional(),
    status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "taslak", "inceleme", "yayinda"]).optional(),
    kapak_gorseli: z.string().url().optional().or(z.literal("")),
    coverImageUrl: z.string().url().optional().or(z.literal("")),
    muhabir: z.string().max(120).optional(),
    reporterName: z.string().max(120).optional(),
    kaynak: z.string().max(120).optional(),
    sourceName: z.string().max(120).optional(),
    kaynak_url: z.string().url().optional().or(z.literal("")),
    sourceUrl: z.string().url().optional().or(z.literal("")),
    slug: z.string().max(160).optional(),
  })
  .superRefine((val, ctx) => {
    if (!(val.baslik ?? val.title)?.trim()) {
      ctx.addIssue({ code: "custom", message: "baslik gerekli", path: ["baslik"] });
    }
    if (!(val.spot ?? val.summary)?.trim()) {
      ctx.addIssue({ code: "custom", message: "spot gerekli", path: ["spot"] });
    }
    if (!(val.icerik ?? val.content)?.trim()) {
      ctx.addIssue({ code: "custom", message: "icerik gerekli", path: ["icerik"] });
    }
    if (!(val.kategori ?? val.category)?.trim()) {
      ctx.addIssue({ code: "custom", message: "kategori gerekli", path: ["kategori"] });
    }
  });

export type HaberWriteInput = z.infer<typeof haberWriteSchema>;

export function mapHaberDurum(
  durum?: string | null,
): "DRAFT" | "REVIEW" | "PUBLISHED" {
  const raw = (durum ?? "taslak").trim();
  const lower = raw.toLocaleLowerCase("tr-TR");
  if (raw === "PUBLISHED" || lower === "yayinda" || lower === "published") return "PUBLISHED";
  if (raw === "REVIEW" || lower === "inceleme" || lower === "review") return "REVIEW";
  return "DRAFT";
}
