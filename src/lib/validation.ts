import { z } from "zod";
import { parseAttachmentUrls } from "@/lib/attachments";
import { isSafeHttpUrl, isSafeMediaUrl } from "@/lib/safe-url";

const optionalSafeMediaUrl = z
  .string()
  .optional()
  .refine((value) => !value?.trim() || isSafeMediaUrl(value), "Geçersiz medya adresi");

const optionalSafeHttpUrl = z
  .string()
  .optional()
  .refine((value) => !value?.trim() || isSafeHttpUrl(value), "Geçerli http(s) bağlantısı girin");

const optionalAttachmentUrl = z
  .string()
  .optional()
  .refine((value) => {
    if (!value?.trim()) return true;
    return parseAttachmentUrls(value).length > 0;
  }, "Geçersiz ek dosya");

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
  attachmentUrl: optionalAttachmentUrl,
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
  attachmentUrl: optionalAttachmentUrl,
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
  coverImageUrl: optionalSafeMediaUrl,
  videoUrl: optionalSafeHttpUrl,
  videoEmbed: z.string().optional(),
  galleryImages: z
    .array(
      z.object({
        url: z.string().min(1).refine(isSafeMediaUrl, "Geçersiz galeri görseli"),
        caption: z.string().optional().default(""),
      }),
    )
    .optional()
    .default([]),
  categoryId: z.string().optional().default(""),
  categoryIds: z.array(z.string()).optional().default([]),
  tagNames: z.string().optional(),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]),
  isBreaking: z.coerce.boolean().default(false),
  isFeatured: z.coerce.boolean().default(false),
  inSpotlight: z.coerce.boolean().default(false),
  inFiveHeadline: z.coerce.boolean().default(false),
  imageMainHeadline: optionalSafeMediaUrl,
  imageTopHeadline: optionalSafeMediaUrl,
  imageSpotlight: optionalSafeMediaUrl,
  imageFiveHeadline: optionalSafeMediaUrl,
  imageSocial: optionalSafeMediaUrl,
  imageStory: optionalSafeMediaUrl,
  reporterName: z.string().optional(),
  sourceName: z.string().optional(),
  sourceUrl: optionalSafeHttpUrl,
  redirectUrl: optionalSafeHttpUrl,
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  publishedAt: z.string().optional(),
  scheduledAt: z.string().optional(),
  isLiveBlog: z.coerce.boolean().default(false),
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
  avatarUrl: optionalSafeMediaUrl,
});

export const profileSchema = z
  .object({
    name: z.string().min(2, "Ad soyad gerekli"),
    email: z.string().email("Geçerli bir e-posta girin"),
    password: optionalPasswordSchema.optional(),
    currentPassword: z.string().optional(),
    bio: z.string().max(2000).optional().or(z.literal("")),
    avatarUrl: optionalSafeMediaUrl,
  })
  .refine((value) => !value.password || Boolean(value.currentPassword?.trim()), {
    message: "Şifre değiştirmek için mevcut şifrenizi girin",
    path: ["currentPassword"],
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
  editorRequiresApproval: z.enum(["0", "1"]).optional(),
  socialAutoShare: z.enum(["0", "1"]).optional(),
  bikPublisherCode: z.string().optional(),
});

export const pageSchema = z.object({
  title: z.string().min(2, "Başlık gerekli"),
  slug: z.string().optional(),
  content: z.string().min(10, "İçerik en az 10 karakter olmalı"),
  published: z.coerce.boolean().default(true),
});

import { AD_SLOT_CODES } from "@/lib/ad-slots";
import { parseAdsenseSnippet } from "@/lib/adsense";

const adKindSchema = z.enum(["BANNER", "ADSENSE"]);

export const adSchema = z
  .object({
    name: z.string().min(2, "Reklam adı gerekli"),
    position: z.enum(AD_SLOT_CODES),
    kind: adKindSchema.default("BANNER"),
    imageUrl: z.string().optional(),
    targetUrl: z.string().optional(),
    adsenseCode: z.string().optional(),
    adsenseSlot: z.string().optional(),
    adsenseLayout: z.string().optional(),
    adsenseFormat: z.string().optional(),
    active: z.coerce.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.kind === "BANNER") {
      const imageUrl = (data.imageUrl ?? "").trim();
      const targetUrl = (data.targetUrl ?? "").trim();
      if (!imageUrl) {
        ctx.addIssue({ code: "custom", message: "Görsel gerekli", path: ["imageUrl"] });
      }
      if (!targetUrl) {
        ctx.addIssue({ code: "custom", message: "Hedef bağlantı gerekli", path: ["targetUrl"] });
      } else if (!isSafeHttpUrl(targetUrl)) {
        ctx.addIssue({
          code: "custom",
          message: "Yalnızca http veya https bağlantıları kullanılabilir",
          path: ["targetUrl"],
        });
      }
      return;
    }

    const parsed = parseAdsenseSnippet(data.adsenseCode ?? "");
    const slot = (data.adsenseSlot ?? parsed?.slot ?? "").trim();
    if (!slot) {
      ctx.addIssue({
        code: "custom",
        message: "AdSense kodundan slot bulunamadı. Kodu yapıştırın veya slot numarasını girin.",
        path: ["adsenseCode"],
      });
    }
  })
  .transform((data) => {
    if (data.kind === "BANNER") {
      return {
        name: data.name,
        position: data.position,
        kind: data.kind,
        imageUrl: (data.imageUrl ?? "").trim(),
        targetUrl: (data.targetUrl ?? "").trim(),
        adsenseSlot: null as string | null,
        adsenseLayout: null as string | null,
        adsenseFormat: null as string | null,
        active: data.active,
      };
    }

    const parsed = parseAdsenseSnippet(data.adsenseCode ?? "");
    return {
      name: data.name,
      position: data.position,
      kind: data.kind,
      imageUrl: "",
      targetUrl: "",
      adsenseSlot: (data.adsenseSlot ?? parsed?.slot ?? "").trim() || null,
      adsenseLayout: (data.adsenseLayout ?? parsed?.layout ?? "").trim() || null,
      adsenseFormat: (data.adsenseFormat ?? parsed?.format ?? "").trim() || null,
      active: data.active,
    };
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

export const pollSchema = z.object({
  question: z.string().min(5, "Soru en az 5 karakter olmalı").max(200),
  description: z.string().max(500).optional().or(z.literal("")),
  coverImageUrl: optionalSafeMediaUrl,
  articleSlug: z.string().max(200).optional().or(z.literal("")),
  active: z.boolean().default(true),
  showResults: z.boolean().default(true),
  endsAt: z.string().optional().or(z.literal("")),
  options: z
    .array(
      z.object({
        label: z.string().min(1, "Seçenek boş olamaz").max(120),
        imageUrl: optionalSafeMediaUrl,
      }),
    )
    .min(2, "En az 2 seçenek gerekli")
    .max(8, "En fazla 8 seçenek"),
});

const electionCandidateSchema = z.object({
  id: z.string().optional(),
  raceType: z.enum(["MAYOR", "COUNCIL"]),
  name: z.string().min(2, "Aday adı gerekli").max(120),
  partyName: z.string().min(1, "Parti adı gerekli").max(80),
  partyColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli HEX renk girin"),
  photoUrl: optionalSafeMediaUrl,
  slogan: z.string().max(160).optional().or(z.literal("")),
  bio: z.string().max(2000).optional().or(z.literal("")),
  votes: z.coerce.number().int().min(0).default(0),
  votePct: z.coerce.number().min(0).max(100).default(0),
  prevVotes: z.coerce.number().int().min(0).optional().nullable(),
  prevVotePct: z.coerce.number().min(0).max(100).optional().nullable(),
});

const electionDistrictSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(80),
  order: z.coerce.number().int().min(0).default(0),
  totalBoxes: z.coerce.number().int().min(0).default(0),
  openBoxes: z.coerce.number().int().min(0).default(0),
  turnoutPct: z.coerce.number().min(0).max(100).default(0),
  results: z
    .array(
      z.object({
        candidateKey: z.string().min(1),
        votes: z.coerce.number().int().min(0).default(0),
        votePct: z.coerce.number().min(0).max(100).default(0),
      }),
    )
    .optional()
    .default([]),
});

export const electionSchema = z.object({
  title: z.string().min(3, "Başlık en az 3 karakter").max(160),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug küçük harf ve tire olmalı"),
  subtitle: z.string().max(200).optional().or(z.literal("")),
  electionDate: z.string().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "UPCOMING", "LIVE", "FINISHED"]),
  showOnHome: z.boolean().default(false),
  isPrimary: z.boolean().default(false),
  liveRefreshSec: z.coerce.number().int().min(15).max(300).default(60),
  totalBoxes: z.coerce.number().int().min(0).default(0),
  openBoxes: z.coerce.number().int().min(0).default(0),
  totalVoters: z.coerce.number().int().min(0).default(0),
  usedVotes: z.coerce.number().int().min(0).default(0),
  validVotes: z.coerce.number().int().min(0).default(0),
  categorySlug: z.string().max(120).optional().or(z.literal("")),
  yskSecimId: z.coerce.number().int().positive().optional().nullable(),
  yskSecimTuru: z.coerce.number().int().positive().optional().nullable(),
  yskIlId: z.coerce.number().int().positive().optional().nullable(),
  yskFocusIlce: z.string().max(120).optional().or(z.literal("")),
  yskSyncEnabled: z.boolean().default(false),
  candidates: z.array(electionCandidateSchema).min(1, "En az bir aday gerekli"),
  districts: z.array(electionDistrictSchema).optional().default([]),
});
