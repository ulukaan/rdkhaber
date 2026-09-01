/**
 * Demo seçim verisi — idempotent (slug: demo-duzce-yerel-secim).
 * Canlıda: node scripts/seed-demo-election.mjs
 */
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { hasDatabaseUrl, skipMessage } from "./ensure-db-utils.mjs";

const SLUG = "demo-duzce-yerel-secim";

function avatar(name, color) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color.replace("#", "")}&color=fff&size=256&bold=true&format=png`;
}

const DISTRICTS = [
  { name: "Merkez", slug: "merkez", order: 0, totalBoxes: 412, openBoxes: 389, turnoutPct: 79.2 },
  { name: "Akçakoca", slug: "akcakoca", order: 1, totalBoxes: 198, openBoxes: 187, turnoutPct: 76.5 },
  { name: "Cumayeri", slug: "cumayeri", order: 2, totalBoxes: 64, openBoxes: 61, turnoutPct: 81.1 },
  { name: "Çilimli", slug: "cilimli", order: 3, totalBoxes: 72, openBoxes: 68, turnoutPct: 77.8 },
  { name: "Gölyaka", slug: "golyaka", order: 4, totalBoxes: 88, openBoxes: 84, turnoutPct: 78.4 },
  { name: "Gümüşova", slug: "gumusova", order: 5, totalBoxes: 56, openBoxes: 53, turnoutPct: 75.9 },
  { name: "Kaynaşlı", slug: "kaynasli", order: 6, totalBoxes: 94, openBoxes: 90, turnoutPct: 80.3 },
  { name: "Yığılca", slug: "yigilca", order: 7, totalBoxes: 48, openBoxes: 45, turnoutPct: 74.6 },
];

const MAYOR_CANDIDATES = [
  {
    name: "Ayşe Demir",
    partyName: "CHP",
    partyColor: "#e30a17",
    photoUrl: avatar("Ayşe Demir", "#e30a17"),
    votes: 142_318,
    votePct: 48.97,
    prevVotes: 128_400,
    prevVotePct: 46.12,
    slogan: "Düzce için birlikte",
    order: 0,
  },
  {
    name: "Mehmet Kaya",
    partyName: "AK Parti",
    partyColor: "#ff9d00",
    photoUrl: avatar("Mehmet Kaya", "#ff9d00"),
    votes: 108_905,
    votePct: 37.48,
    prevVotes: 115_220,
    prevVotePct: 41.38,
    slogan: "Hizmet ve istikrar",
    order: 1,
  },
  {
    name: "Selin Arslan",
    partyName: "İYİ Parti",
    partyColor: "#0099ff",
    photoUrl: avatar("Selin Arslan", "#0099ff"),
    votes: 24_612,
    votePct: 8.47,
    prevVotes: 18_900,
    prevVotePct: 6.79,
    slogan: "Şeffaf yönetim",
    order: 2,
  },
  {
    name: "Hasan Yıldız",
    partyName: "Yeniden Refah",
    partyColor: "#006400",
    photoUrl: avatar("Hasan Yıldız", "#006400"),
    votes: 14_877,
    votePct: 5.12,
    prevVotes: null,
    prevVotePct: null,
    slogan: "Adil paylaşım",
    order: 3,
  },
];

const COUNCIL_CANDIDATES = [
  { name: "CHP", partyName: "CHP", partyColor: "#e30a17", votes: 138_200, votePct: 47.6, order: 0 },
  { name: "AK Parti", partyName: "AK Parti", partyColor: "#ff9d00", votes: 112_450, votePct: 38.7, order: 1 },
  { name: "MHP", partyName: "MHP", partyColor: "#c1121f", votes: 22_100, votePct: 7.6, order: 2 },
];

async function main() {
  if (!hasDatabaseUrl()) {
    skipMessage("seed-demo-election");
    return;
  }

  const prisma = new PrismaClient();
  try {
    const existing = await prisma.election.findUnique({
      where: { slug: SLUG },
      include: { candidates: true },
    });
    if (existing) {
      let updated = 0;
      for (const candidate of existing.candidates) {
        if (candidate.photoUrl) continue;
        const source = [...MAYOR_CANDIDATES, ...COUNCIL_CANDIDATES].find((c) => c.name === candidate.name);
        const photoUrl = source?.photoUrl ?? avatar(candidate.name, candidate.partyColor);
        await prisma.electionCandidate.update({
          where: { id: candidate.id },
          data: { photoUrl },
        });
        updated += 1;
      }
      if (updated > 0) {
        console.log(`seed-demo-election: "${SLUG}" — ${updated} aday fotoğrafı güncellendi.`);
      } else {
        console.log(`seed-demo-election: "${SLUG}" zaten var, atlandı.`);
      }
      return;
    }

    await prisma.election.updateMany({ where: { isPrimary: true }, data: { isPrimary: false } });

    const electionId = randomUUID();
    const now = new Date("2024-03-31T21:30:00.000Z");

    await prisma.election.create({
      data: {
        id: electionId,
        slug: SLUG,
        title: "Düzce Yerel Seçim 2024",
        subtitle: "Demo seçim ekranı — örnek aday ve sandık verileri",
        electionDate: new Date("2024-03-31T08:00:00.000Z"),
        status: "LIVE",
        showOnHome: true,
        isPrimary: true,
        liveRefreshSec: 60,
        totalBoxes: 1032,
        openBoxes: 977,
        totalVoters: 412_580,
        usedVotes: 325_410,
        validVotes: 290_712,
        categorySlug: "secim",
        lastResultsAt: now,
        updatedAt: now,
        candidates: {
          create: [
            ...MAYOR_CANDIDATES.map((c) => ({
              id: randomUUID(),
              raceType: "MAYOR",
              name: c.name,
            partyName: c.partyName,
            partyColor: c.partyColor,
            photoUrl: c.photoUrl,
            slogan: c.slogan,
              votes: c.votes,
              votePct: c.votePct,
              prevVotes: c.prevVotes,
              prevVotePct: c.prevVotePct,
              order: c.order,
            })),
            ...COUNCIL_CANDIDATES.map((c) => ({
              id: randomUUID(),
              raceType: "COUNCIL",
              name: c.name,
              partyName: c.partyName,
              partyColor: c.partyColor,
              votes: c.votes,
              votePct: c.votePct,
              order: c.order,
            })),
          ],
        },
        districts: {
          create: DISTRICTS.map((d) => ({
            id: randomUUID(),
            name: d.name,
            slug: d.slug,
            order: d.order,
            totalBoxes: d.totalBoxes,
            openBoxes: d.openBoxes,
            turnoutPct: d.turnoutPct,
          })),
        },
      },
    });

    console.log(`seed-demo-election: "${SLUG}" oluşturuldu → /secim`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("seed-demo-election failed:", err?.message ?? err);
  process.exitCode = 1;
});
