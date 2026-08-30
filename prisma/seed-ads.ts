/**
 * Örnek reklam seed'i — mevcut içeriğe dokunmaz.
 *
 * public/reklam/ altına slot ölçülerine uygun SVG banner'lar üretir ve
 * her slot için AdSlot kaydını upsert eder. Yalnızca reklam tablosunu
 * etkiler; haber/ayar/kullanıcı verisi silinmez.
 *
 * Çalıştırmak için:  npm run seed:ads
 */
import { PrismaClient } from "@prisma/client";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();

type Sample = {
  code: string;
  name: string;
  w: number;
  h: number;
  brand: string;
  from: string;
  to: string;
  accent: string;
  /** false ise panelde görünür ama sitede yayınlanmaz. */
  active?: boolean;
};

const SAMPLES: Sample[] = [
  { code: "152", name: "Örnek — Üst Banner", w: 970, h: 90, brand: "Düzce Yapı Market", from: "#1e293b", to: "#0f172a", accent: "#f8b400" },
  { code: "151", name: "Örnek — Manşet Altı", w: 728, h: 90, brand: "Radikal Sigorta", from: "#0f766e", to: "#134e4a", accent: "#5eead4" },
  { code: "150", name: "Örnek — Kategori Altı", w: 970, h: 250, brand: "Konuralp Otomotiv", from: "#1e3a8a", to: "#172554", accent: "#93c5fd" },
  { code: "069", name: "Örnek — Manşet Yan Kule", w: 320, h: 480, brand: "Akçakoca Turizm", from: "#7c2d12", to: "#431407", accent: "#fdba74" },
  // 1300x470'lik dev format sayfayı ezdiği için pasif başlar; panelden açılabilir.
  { code: "068", name: "Örnek — Anamanşet Üstü", w: 1300, h: 470, brand: "Düzce Üniversitesi", from: "#581c87", to: "#3b0764", accent: "#e9d5ff", active: false },
  { code: "300", name: "Örnek — Sağ Sütun", w: 320, h: 100, brand: "Beyköy Emlak", from: "#155e75", to: "#083344", accent: "#67e8f9" },
  { code: "036", name: "Örnek — Sol Kule", w: 160, h: 600, brand: "Cedidiye Optik", from: "#831843", to: "#500724", accent: "#fbcfe8" },
  { code: "009", name: "Örnek — Sağ Kule", w: 160, h: 600, brand: "Kaynaşlı Nakliyat", from: "#14532d", to: "#052e16", accent: "#bbf7d0" },
  { code: "128", name: "Örnek — Haber Metni Başı", w: 728, h: 90, brand: "Düzce Ticaret Odası", from: "#7f1d1d", to: "#450a0a", accent: "#fca5a5" },
  { code: "138", name: "Örnek — Haber Metni Sonu", w: 728, h: 90, brand: "Gümüşova Lojistik", from: "#334155", to: "#0f172a", accent: "#cbd5e1" },
  { code: "1003", name: "Örnek — Paragraf Arası", w: 728, h: 90, brand: "Yığılca Doğal Bal", from: "#854d0e", to: "#422006", accent: "#fde68a" },
  { code: "153", name: "Örnek — Sabit Alt Banner", w: 970, h: 90, brand: "Düzce Belediyesi", from: "#0c4a6e", to: "#082f49", accent: "#7dd3fc" },
  // Açılış modalı rahatsız edici olabileceği için pasif başlar; panelden açılabilir.
  { code: "077", name: "Örnek — Açılış Reklamı", w: 336, h: 280, brand: "Düzce Fuar Merkezi", from: "#3f6212", to: "#1a2e05", accent: "#d9f99d", active: false },
];

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function banner(s: Sample) {
  const { w, h, brand, from, to, accent } = s;
  const tall = h > w * 1.5;
  const wide = w >= h * 2.5;
  const unit = Math.min(w, h);

  // Banner biçimine göre tipografi ölçeği.
  const noteSize = Math.max(9, tall ? unit * 0.075 : wide ? h * 0.14 : unit * 0.065);
  const pad = Math.max(8, unit * 0.05);
  const radius = Math.min(16, unit * 0.06);

  // Uzun markaları dar banner'larda kelime kelime alt alta yaz.
  const words = brand.split(" ");
  const lines = tall || !wide ? words : [brand];

  // Şekle göre hesaplanan punto, banner genişliğini aşmayacak şekilde kısılır.
  const shapeSize = tall ? unit * 0.15 : wide ? h * 0.3 : unit * 0.13;
  const longest = Math.max(...lines.map((l) => l.length));
  const widthLimit = (w - pad * 2.5) / (longest * 0.6);
  const heightLimit = (h - pad * 3 - noteSize * 2) / (lines.length * 1.15);
  const brandSize = Math.max(10, Math.min(shapeSize, widthLimit, heightLimit));

  const lineHeight = brandSize * 1.15;
  const blockHeight = lines.length * lineHeight;
  const startY = h / 2 - blockHeight / 2 + brandSize * 0.85;

  const brandLines = lines
    .map(
      (line, i) =>
        `<text x="${w / 2}" y="${startY + i * lineHeight}" font-family="Segoe UI, Arial, sans-serif" font-size="${brandSize.toFixed(1)}" font-weight="800" fill="#ffffff" text-anchor="middle">${esc(line)}</text>`,
    )
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(brand)} örnek reklam">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect x="${pad / 2}" y="${pad / 2}" width="${w - pad}" height="${h - pad}" fill="none" stroke="${accent}" stroke-opacity="0.35" stroke-width="1.5" rx="${radius}"/>
  <rect x="${pad}" y="${pad}" width="${Math.max(30, noteSize * 4.2)}" height="${noteSize * 1.7}" rx="${noteSize * 0.35}" fill="${accent}" fill-opacity="0.9"/>
  <text x="${pad + Math.max(30, noteSize * 4.2) / 2}" y="${pad + noteSize * 1.22}" font-family="Segoe UI, Arial, sans-serif" font-size="${(noteSize * 0.8).toFixed(1)}" font-weight="700" fill="${to}" text-anchor="middle" letter-spacing="1">REKLAM</text>
  ${brandLines}
  <text x="${w / 2}" y="${h - pad * 1.1}" font-family="Segoe UI, Arial, sans-serif" font-size="${noteSize.toFixed(1)}" fill="${accent}" fill-opacity="0.85" text-anchor="middle" letter-spacing="0.5">${w}x${h} — örnek görsel</text>
</svg>
`;
}

async function main() {
  const dir = path.join(process.cwd(), "public", "reklam");
  await mkdir(dir, { recursive: true });

  console.log("📢 Örnek reklamlar ekleniyor...");

  for (const s of SAMPLES) {
    const file = `ornek-${s.code}.svg`;
    await writeFile(path.join(dir, file), banner(s), "utf8");

    const data = {
      name: s.name,
      imageUrl: `/reklam/${file}`,
      targetUrl: "https://example.com",
      active: s.active ?? true,
    };

    await prisma.adSlot.upsert({
      where: { position: s.code },
      update: data,
      create: { position: s.code, ...data },
    });

    console.log(`   ${s.active === false ? "○" : "●"} ${s.code} — ${s.name} (${s.w}x${s.h})`);
  }

  console.log(`✅ ${SAMPLES.length} örnek reklam hazır. Yönetim > Reklam Grupları bölümünden düzenleyebilirsiniz.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
