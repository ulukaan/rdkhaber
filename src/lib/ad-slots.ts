export type AdSlotDef = {
  code: string;
  name: string;
  desktop?: string;
  mobile?: string;
  imageOnly?: boolean;
  note?: string;
};

export type AdGroupDef = {
  id: string;
  title: string;
  slots: AdSlotDef[];
};

export const AD_GROUPS: AdGroupDef[] = [
  {
    id: "amp",
    title: "AMP Reklamlar",
    slots: [
      { code: "1000", name: "Başlık Altı" },
      { code: "1001", name: "Sosyal Medya Paylaşım Altı" },
      { code: "1003", name: "Paragraf Arası" },
      { code: "1004", name: "İçerik Metni Sonu" },
    ],
  },
  {
    id: "detail",
    title: "Alt Sayfa Reklamlar",
    slots: [
      { code: "131", name: "Başlık Üstü", desktop: "728x90", mobile: "300x50" },
      { code: "128", name: "Detay Metni Başlangıcı", desktop: "728x90", mobile: "300x50" },
      { code: "138", name: "Detay Metni Sonu", desktop: "728x90", mobile: "300x50" },
      { code: "133", name: "İlginizi Çekebilir Altı", desktop: "728x90", mobile: "300x50" },
      { code: "134", name: "İnfinite Üst", desktop: "728x90", mobile: "300x50" },
    ],
  },
  {
    id: "home",
    title: "Ana Reklamlar",
    slots: [
      { code: "152", name: "En Üst", desktop: "970x90", mobile: "300x50" },
      { code: "150", name: "Kategori Altı", desktop: "970x250", mobile: "300x100" },
      { code: "151", name: "Kategori - Manşetler Altı", desktop: "728x90", mobile: "300x50" },
      { code: "077", name: "Açılış (Modal) Reklam", desktop: "336x280" },
      { code: "153", name: "Site Altı Fixed Reklamı", desktop: "970x90", mobile: "300x50" },
    ],
  },
  {
    id: "flow",
    title: "Flow Reklamlar",
    slots: [
      { code: "067", name: "Hikaye Reklamı", desktop: "720x1280", mobile: "720x1280", imageOnly: true },
      { code: "068", name: "Anamanşet Reklamı", desktop: "1300x470", imageOnly: true },
      { code: "069", name: "Anamanşet Yan Kısım (Öne Çıkanlar)", desktop: "320x480", mobile: "320x480" },
      { code: "070", name: "Anamanşet - Öne Çıkanlar Arası", desktop: "320x250", mobile: "320x250", note: "Sadece mobil" },
    ],
  },
  {
    id: "gallery",
    title: "Foto Galeri Reklamları",
    slots: [
      { code: "034", name: "Foto Galeri Akış Reklam", desktop: "728x90", mobile: "300x50" },
      { code: "167", name: "Fotoğraf Altı", desktop: "728x90", mobile: "300x50" },
      { code: "168", name: "Sayfalandırma Altı", desktop: "728x90", mobile: "300x50" },
      { code: "169", name: "Öne Çıkanlar Altı", desktop: "728x90", mobile: "300x50" },
    ],
  },
  {
    id: "tower",
    title: "Kule Reklamlar",
    slots: [
      { code: "036", name: "Sol Kule", desktop: "160x600" },
      { code: "009", name: "Sağ Kule", desktop: "160x600" },
    ],
  },
  {
    id: "paragraph",
    title: "Paragraf Reklamlar",
    slots: [{ code: "121", name: "Paragraf Tekrar Eden" }],
  },
  {
    id: "service",
    title: "Servis Reklamları",
    slots: [
      {
        code: "300",
        name: "İmsakiye (Öğeler Orta Bölüm)",
        desktop: "320x100",
        mobile: "300x50",
      },
    ],
  },
];

export const ALL_AD_SLOTS: AdSlotDef[] = AD_GROUPS.flatMap((g) => g.slots);

export const AD_SLOT_CODES = ALL_AD_SLOTS.map((s) => s.code) as [string, ...string[]];

const LEGACY: Record<string, string> = {
  HEADER_BANNER: "152",
  SIDEBAR: "009",
  IN_ARTICLE: "1003",
  HOMEPAGE_STRIP: "151",
};

export function normalizeSlotCode(position: string) {
  return LEGACY[position] ?? position;
}

export function lookupCodes(code: string) {
  const normalized = normalizeSlotCode(code);
  const legacy = Object.entries(LEGACY)
    .filter(([, mapped]) => mapped === normalized)
    .map(([old]) => old);
  return [...new Set([code, normalized, ...legacy])];
}

export function getAdSlotDef(code: string) {
  return ALL_AD_SLOTS.find((s) => s.code === normalizeSlotCode(code));
}

export function formatSlotSize(slot: AdSlotDef) {
  if (slot.desktop && slot.mobile) return `D:[${slot.desktop}] - M:[${slot.mobile}]`;
  if (slot.desktop) return `D:[${slot.desktop}]`;
  return null;
}

export function parseSize(size?: string) {
  if (!size) return null;
  const [w, h] = size.split("x").map(Number);
  if (!w || !h) return null;
  return { w, h };
}
