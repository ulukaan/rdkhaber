import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(1, "Şifre gerekli"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Ad soyad gerekli"),
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(10, "Şifre en az 10 karakter olmalı"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(20, "Geçersiz bağlantı"),
    password: z.string().min(10, "Şifre en az 10 karakter olmalı"),
    passwordConfirm: z.string().min(1, "Şifre tekrarı gerekli"),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    message: "Şifreler eşleşmiyor",
    path: ["passwordConfirm"],
  });

export const tipSchema = z.object({
  message: z.string().min(10, "Lütfen en az 10 karakter yazın"),
  contactInfo: z.string().optional(),
  attachmentUrl: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Ad soyad gerekli"),
  email: z.string().email("Geçerli bir e-posta girin"),
  phone: z.string().optional(),
  message: z.string().min(10, "Lütfen en az 10 karakter yazın"),
});

export const newsSubmissionSchema = z.object({
  title: z.string().min(5, "Başlık en az 5 karakter olmalı"),
  content: z.string().min(20, "İçerik en az 20 karakter olmalı"),
  submitterName: z.string().optional(),
  submitterEmail: z.string().email("Geçerli bir e-posta girin").optional().or(z.literal("")),
  attachmentUrl: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Kategori adı gerekli"),
  slug: z.string().min(2, "Adres son eki gerekli"),
  description: z.string().optional().or(z.literal("")),
  color: z.string().optional().or(z.literal("")),
  order: z.coerce.number().int().default(0),
  parentId: z.string().optional().or(z.literal("")),
  headingH1: z.string().max(160).optional().or(z.literal("")),
  boxCount: z.coerce.number().int().min(1).max(96).default(18),
  photoGallery: z.boolean().default(false),
  videoGallery: z.boolean().default(false),
  fixedDesign: z.boolean().default(false),
  fixedTemplate: z.enum(["klasik", "liste", "dergi", "spor", "ekonomi", "magazin", ""]).optional(),
  hoverColor: z.string().optional().or(z.literal("")),
  headerTextColor: z.string().optional().or(z.literal("")),
  headerHoverColor: z.string().optional().or(z.literal("")),
});

export const tagSchema = z.object({
  name: z.string().min(1, "Etiket adı gerekli"),
  slug: z.string().min(1, "Slug gerekli"),
});

export const headlineDesignSchema = z.object({
  headlineKicker: z.string().optional(),
  headlineTitle: z.string().min(3, "Ana başlık gerekli"),
  headlineSub: z.string().optional(),
  headlineAlign: z.enum(["left", "center", "right"]).default("left"),
  headlineImageAlign: z.enum(["left", "center", "right"]).default("center"),
});

export const articleSchema = z.object({
  title: z.string().min(5, "Başlık en az 5 karakter olmalı"),
  slug: z.string().min(3, "Slug gerekli"),
  summary: z.string().min(10, "Özet en az 10 karakter olmalı"),
  content: z.string().min(20, "İçerik en az 20 karakter olmalı"),
  coverImageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  videoEmbed: z.string().optional(),
  galleryImages: z
    .array(
      z.object({
        url: z.string().min(1),
        caption: z.string().optional().default(""),
      }),
    )
    .optional()
    .default([]),
  categoryId: z.string().min(1, "Kategori seçin"),
  tagNames: z.string().optional(),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]),
  isBreaking: z.coerce.boolean().default(false),
  isFeatured: z.coerce.boolean().default(false),
  inSpotlight: z.coerce.boolean().default(false),
  inFiveHeadline: z.coerce.boolean().default(false),
  imageMainHeadline: z.string().optional(),
  imageTopHeadline: z.string().optional(),
  imageSpotlight: z.string().optional(),
  imageFiveHeadline: z.string().optional(),
  imageSocial: z.string().optional(),
  imageStory: z.string().optional(),
  reporterName: z.string().optional(),
  sourceName: z.string().optional(),
  sourceUrl: z.string().optional(),
  redirectUrl: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  publishedAt: z.string().optional(),
});

const optionalPasswordSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || value.length >= 10, "Şifre en az 10 karakter olmalı");

export const userSchema = z.object({
  name: z.string().min(2, "Ad soyad gerekli"),
  email: z.string().email("Geçerli bir e-posta girin"),
  password: optionalPasswordSchema.optional(),
  role: z.enum(["ADMIN", "EDITOR", "USER"]),
  active: z.coerce.boolean().default(true),
  slug: z.string().max(80).optional().or(z.literal("")),
  bio: z.string().max(2000).optional().or(z.literal("")),
  avatarUrl: z.string().max(500).optional().or(z.literal("")),
});

export const commentSchema = z.object({
  articleId: z.string().min(1),
  content: z.string().min(2, "Yorum en az 2 karakter olmalı").max(2000, "Yorum çok uzun"),
  authorName: z.string().min(2, "Adınızı girin"),
  authorEmail: z.string().email("Geçerli bir e-posta girin").optional().or(z.literal("")),
});

export const settingsSchema = z.object({
  siteName: z.string().min(1),
  siteSlogan: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Geçerli bir renk kodu girin"),
  whatsappNumber: z.string().min(1),
  tipLinePhone: z.string().optional(),
  tipLineEmail: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  footerAbout: z.string().optional(),
  copyrightText: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  facebookUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
});

export const pageSchema = z.object({
  title: z.string().min(2, "Başlık gerekli"),
  slug: z.string().optional(),
  content: z.string().min(10, "İçerik en az 10 karakter olmalı"),
  published: z.coerce.boolean().default(true),
});

import { AD_SLOT_CODES } from "@/lib/ad-slots";

export const adSchema = z.object({
  name: z.string().min(2, "Reklam adı gerekli"),
  position: z.enum(AD_SLOT_CODES),
  imageUrl: z.string().min(1, "Görsel gerekli"),
  targetUrl: z.string().min(1, "Hedef bağlantı gerekli"),
  active: z.coerce.boolean().default(true),
});

export const gallerySchema = z.object({
  title: z.string().min(2, "Başlık gerekli"),
  slug: z.string().optional(),
  coverImageUrl: z.string().optional(),
});

export const haberBotSourceSchema = z.object({
  name: z.string().min(2, "Kaynak adı gerekli"),
  url: z.string().min(4, "Site adresi gerekli"),
  categoryId: z.string().min(1, "Kategori seçin"),
  maxItems: z.coerce.number().int().min(1).max(30).default(10),
  importStatus: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export const haberBotWordSchema = z.object({
  find: z.string().min(1, "Eski kelime gerekli").max(200),
  replace: z.string().max(200).default(""),
});

export const newsletterSubscribeSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  name: z.string().max(80).optional().or(z.literal("")),
});

export const newsletterCampaignSchema = z.object({
  subject: z.string().min(3, "Konu en az 3 karakter olmalı").max(160),
  preheader: z.string().max(180).optional().or(z.literal("")),
  content: z.string().min(20, "Bülten metni gerekli"),
});

export const newsletterSmtpSchema = z.object({
  newsletterFromName: z.string().max(80).optional().or(z.literal("")),
  newsletterFromEmail: z.string().email("Geçerli bir gönderen e-posta girin").optional().or(z.literal("")),
  newsletterSmtpHost: z.string().max(200).optional().or(z.literal("")),
  newsletterSmtpPort: z.string().max(6).optional().or(z.literal("")),
  newsletterSmtpUser: z.string().max(200).optional().or(z.literal("")),
  newsletterSmtpPass: z.string().max(200).optional().or(z.literal("")),
  newsletterSmtpSecure: z.enum(["0", "1"]).optional(),
});

export const composeMailSchema = z.object({
  to: z.string().email("Geçerli alıcı e-postası girin"),
  subject: z.string().min(1, "Konu gerekli").max(200),
  body: z.string().min(1, "Mesaj gerekli").max(50_000),
});
