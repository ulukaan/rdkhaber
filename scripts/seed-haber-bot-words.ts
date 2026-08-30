import { readFileSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { parseWordTemplate } from "../src/lib/haber-bot/words";

const prisma = new PrismaClient();

async function main() {
  const file = path.join(process.cwd(), "scripts", "data", "haber-bot-words.tsv");
  const raw = readFileSync(file, "utf8");
  const pairs = parseWordTemplate(raw);

  if (pairs.length === 0) {
    throw new Error("Kelime kalıbı boş.");
  }

  let added = 0;
  let updated = 0;
  let order = 0;

  for (const pair of pairs) {
    order += 1;
    const existing = await prisma.haberBotWord.findUnique({ where: { find: pair.find } });
    if (existing) {
      await prisma.haberBotWord.update({
        where: { id: existing.id },
        data: { replace: pair.replace, active: true, order },
      });
      updated += 1;
    } else {
      await prisma.haberBotWord.create({
        data: { find: pair.find, replace: pair.replace, active: true, order },
      });
      added += 1;
    }
  }

  const total = await prisma.haberBotWord.count();
  console.log(`Kalıp: ${pairs.length} satır · eklendi ${added} · güncellendi ${updated} · toplam ${total}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
