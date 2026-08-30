import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const TR = { ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", I: "i", İ: "i", ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u" };

function slugify(input) {
  const r = String(input).replace(/[çÇğĞıIİöÖşŞüÜ]/g, (c) => TR[c] ?? c);
  return r
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const users = await prisma.$queryRawUnsafe("SELECT id, name, slug FROM User");
const used = new Set(users.map((u) => u.slug).filter(Boolean));

for (const u of users) {
  const root = slugify(u.name) || `yazar-${String(u.id).slice(-6)}`;
  let candidate = root;
  let n = 2;
  // Always refresh placeholder yazar-* slugs to name-based ones
  const isPlaceholder = !u.slug || String(u.slug).startsWith("yazar-");
  if (!isPlaceholder) {
    used.add(u.slug);
    continue;
  }
  while (used.has(candidate) && candidate !== u.slug) {
    candidate = `${root}-${n}`;
    n += 1;
  }
  used.add(candidate);
  await prisma.$executeRawUnsafe("UPDATE User SET slug = ? WHERE id = ?", candidate, u.id);
  console.log(`${u.name} -> ${candidate}`);
}

await prisma.$disconnect();
