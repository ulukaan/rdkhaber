#!/usr/bin/env node
/** Veritabanındaki AdSense kimliğinden public/ads.txt üretir (Google tarayıcı uyumu). */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function buildAdsTxtContent(clientId) {
  const client = String(clientId ?? "")
    .trim()
    .toLowerCase();
  const pub = client.replace(/^ca-pub-/, "");
  if (!pub) return "";
  return `google.com, pub-${pub}, DIRECT, f08c47fec0942fa0\n`;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("sync-ads-txt: DATABASE_URL yok, atlandı.");
    return;
  }

  const row = await prisma.setting.findUnique({ where: { key: "googleAdsenseClient" } });
  const body = buildAdsTxtContent(row?.value ?? "");
  const target = resolve(process.cwd(), "public/ads.txt");

  if (!body) {
    console.log("sync-ads-txt: googleAdsenseClient boş, public/ads.txt yazılmadı.");
    return;
  }

  writeFileSync(target, body, "utf8");
  console.log(`sync-ads-txt: ${target} güncellendi.`);
}

main()
  .catch((error) => {
    console.error("sync-ads-txt hata:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
