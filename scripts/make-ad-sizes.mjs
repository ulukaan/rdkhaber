import sharp from "sharp";
import { writeFileSync } from "fs";
import { join } from "path";

const dir = join(process.cwd(), "public", "reklam");

function svgBanner({ w, h, title, sub, cta }) {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e92d28"/>
      <stop offset="55%" stop-color="#c41f1b"/>
      <stop offset="55%" stop-color="#fff7f6"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <text x="28" y="${Math.round(h * 0.42)}" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(h * 0.28)}" font-weight="800" fill="#fff">${title}</text>
  <text x="28" y="${Math.round(h * 0.72)}" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(h * 0.16)}" font-weight="600" fill="#ffe4e2">${sub}</text>
  <rect x="${w - 200}" y="${Math.round((h - 36) / 2)}" width="172" height="36" rx="8" fill="#e92d28"/>
  <text x="${w - 114}" y="${Math.round(h / 2 + 5)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="800" fill="#fff">${cta}</text>
</svg>`);
}

function svgPortrait({ w, h, title, sub, cta }) {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
  <rect width="${w}" height="${h}" fill="#e92d28"/>
  <rect x="16" y="16" width="${w - 32}" height="${h - 32}" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="2"/>
  <text x="${w / 2}" y="${Math.round(h * 0.28)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="800" fill="#fff">${title}</text>
  <text x="${w / 2}" y="${Math.round(h * 0.38)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="600" fill="#ffe4e2">${sub}</text>
  <rect x="${Math.round((w - 160) / 2)}" y="${Math.round(h * 0.72)}" width="160" height="40" rx="8" fill="#fff"/>
  <text x="${w / 2}" y="${Math.round(h * 0.72 + 26)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="800" fill="#e92d28">${cta}</text>
</svg>`);
}

function svgSquare({ w, title, sub }) {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w}" viewBox="0 0 ${w} ${w}" role="img">
  <rect width="${w}" height="${w}" fill="#e92d28"/>
  <text x="${w / 2}" y="${Math.round(w * 0.42)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="800" fill="#fff">${title}</text>
  <text x="${w / 2}" y="${Math.round(w * 0.55)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="600" fill="#ffe4e2">${sub}</text>
</svg>`);
}

// From photo assets where useful
await sharp(join(dir, "tarifpark-skyscraper.png"))
  .resize(320, 480, { fit: "cover", position: "centre" })
  .png()
  .toFile(join(dir, "tarifpark-320x480.png"));

await sharp(join(dir, "tarifpark-banner.png"))
  .resize(728, 90, { fit: "cover", position: "centre" })
  .png()
  .toFile(join(dir, "tarifpark-728x90.png"));

await sharp(join(dir, "tarifpark-banner.png"))
  .resize(970, 250, { fit: "cover", position: "centre" })
  .png()
  .toFile(join(dir, "tarifpark-970x250.png"));

await sharp(join(dir, "tarifpark-banner.png"))
  .resize(320, 100, { fit: "cover", position: "centre" })
  .png()
  .toFile(join(dir, "tarifpark-320x100.png"));

await sharp(join(dir, "tarifpark-square.png"))
  .resize(320, 250, { fit: "cover", position: "centre" })
  .png()
  .toFile(join(dir, "tarifpark-320x250.png"));

await sharp(join(dir, "tarifpark-square.png"))
  .resize(336, 280, { fit: "cover", position: "centre" })
  .png()
  .toFile(join(dir, "tarifpark-336x280.png"));

await sharp(join(dir, "tarifpark-skyscraper.png"))
  .resize(160, 600, { fit: "cover", position: "centre" })
  .png()
  .toFile(join(dir, "tarifpark-160x600.png"));

// Clean SVG fallbacks too
writeFileSync(join(dir, "tarifpark-728x90.svg"), svgBanner({ w: 728, h: 90, title: "TarifPark", sub: "Ne pisirmek istedigini bul.", cta: "Tarifleri Kesfet" }));
writeFileSync(join(dir, "tarifpark-320x100.svg"), svgBanner({ w: 320, h: 100, title: "TarifPark", sub: "Binlerce tarif", cta: "Kesfet" }));
writeFileSync(join(dir, "tarifpark-320x480.svg"), svgPortrait({ w: 320, h: 480, title: "TarifPark", sub: "Ne pisirmek istedigini bul.", cta: "Kesfet" }));
writeFileSync(join(dir, "tarifpark-320x320.svg"), svgSquare({ w: 320, title: "TarifPark", sub: "Tarifleri kesfet" }));

console.log("ok");
