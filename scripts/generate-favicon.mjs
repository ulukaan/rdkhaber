/**
 * Logo dosyasından favicon ve uygulama ikonları üretir.
 * Kullanım: node scripts/generate-favicon.mjs
 */
import sharp from "sharp";
import { readFile, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const logoPath = path.join(root, "public/brand/logo.png");
const brandDir = path.join(root, "public/brand");
const appDir = path.join(root, "src/app");

const BRAND_RED = { r: 208, g: 2, b: 27, alpha: 1 };
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

async function squareIcon(size, outPath, { background = WHITE, logoScale = 0.88 } = {}) {
  const logoMeta = await sharp(logoPath).metadata();
  const inner = Math.round(size * logoScale);
  const logo = await sharp(logoPath)
    .resize({
      width: inner,
      height: inner,
      fit: "inside",
      withoutEnlargement: logoMeta.width <= inner && logoMeta.height <= inner,
    })
    .png()
    .toBuffer();

  const resized = await sharp(logo).metadata();
  const left = Math.round((size - (resized.width ?? size)) / 2);
  const top = Math.round((size - (resized.height ?? size)) / 2);

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: logo, left, top }])
    .png()
    .toFile(outPath);
}

async function writeIco(sizes, outPath) {
  // Minimal ICO: PNG payloads embedded (supported by modern browsers / Windows)
  const pngs = await Promise.all(
    sizes.map(async (size) => {
      const buf = await sharp(path.join(brandDir, "favicon.png"))
        .resize(size, size)
        .png()
        .toBuffer();
      return { size, buf };
    }),
  );

  // Build ICO manually with PNG compression type
  const images = pngs.map(({ size, buf }) => ({ width: size, height: size, buf }));
  const count = images.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const entries = images.map(({ width, height, buf }) => {
    const entry = { width, height, buf, offset };
    offset += buf.length;
    return entry;
  });

  const total = offset;
  const out = Buffer.alloc(total);
  out.writeUInt16LE(0, 0);
  out.writeUInt16LE(1, 2);
  out.writeUInt16LE(count, 4);

  entries.forEach((entry, i) => {
    const base = 6 + i * 16;
    out.writeUInt8(entry.width >= 256 ? 0 : entry.width, base);
    out.writeUInt8(entry.height >= 256 ? 0 : entry.height, base + 1);
    out.writeUInt8(0, base + 2);
    out.writeUInt8(0, base + 3);
    out.writeUInt16LE(1, base + 4);
    out.writeUInt16LE(32, base + 6);
    out.writeUInt32LE(entry.buf.length, base + 8);
    out.writeUInt32LE(entry.offset, base + 12);
  });

  entries.forEach((entry) => {
    entry.buf.copy(out, entry.offset);
  });

  await writeFile(outPath, out);
}

async function croppedLogoSquare(size, outPath, crop) {
  const meta = await sharp(logoPath).metadata();
  const w = meta.width ?? 1600;
  const h = meta.height ?? 573;
  const left = Math.round(w * crop.left);
  const top = Math.round(h * crop.top);
  const width = Math.round(w * crop.width);
  const height = Math.round(h * crop.height);

  const cropped = await sharp(logoPath)
    .extract({ left, top, width, height })
    .resize({
      width: Math.round(size * 0.9),
      height: Math.round(size * 0.9),
      fit: "inside",
    })
    .png()
    .toBuffer();

  const info = await sharp(cropped).metadata();
  const padLeft = Math.round((size - (info.width ?? size)) / 2);
  const padTop = Math.round((size - (info.height ?? size)) / 2);

  await sharp({
    create: { width: size, height: size, channels: 4, background: WHITE },
  })
    .composite([{ input: cropped, left: padLeft, top: padTop }])
    .png()
    .toFile(outPath);
}

async function main() {
  await squareIcon(512, path.join(brandDir, "icon-512.png"));
  await squareIcon(192, path.join(brandDir, "icon-192.png"));
  await squareIcon(180, path.join(brandDir, "apple-touch-icon.png"));

  // Küçük sekme ikonu: "radikal" kısmına odaklı kırpma — 16–32px'te okunaklı
  await croppedLogoSquare(32, path.join(brandDir, "favicon.png"), {
    left: 0.12,
    top: 0.05,
    width: 0.62,
    height: 0.9,
  });
  await copyFile(path.join(brandDir, "favicon.png"), path.join(appDir, "icon.png"));

  await squareIcon(32, path.join(brandDir, "favicon-red.png"), {
    background: BRAND_RED,
    logoScale: 0.82,
  });

  await writeIco([16, 32], path.join(appDir, "favicon.ico"));

  console.log("Favicon set generated:");
  console.log("  public/brand/favicon.png");
  console.log("  public/brand/apple-touch-icon.png");
  console.log("  src/app/icon.png");
  console.log("  src/app/favicon.ico");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
