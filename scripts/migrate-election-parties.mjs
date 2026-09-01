/**
 * Mevcut ElectionCandidate.partyName → Party + CandidatePartySupport
 * Her seçim için 1. tur (ElectionRound) oluşturur.
 */
import { PrismaClient } from "@prisma/client";
import { hasDatabaseUrl, skipMessage } from "./ensure-db-utils.mjs";

const prisma = new PrismaClient();

const PARTY_SLUG_ALIASES = {
  "ak parti": "ak-parti",
  akparti: "ak-parti",
  chp: "chp",
  mhp: "mhp",
  "iyi parti": "iyi-parti",
  "dem parti": "dem-parti",
  "yeniden refah": "yeniden-refah",
};

function slugify(input) {
  return input
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function partySlug(name) {
  const key = name.trim().toLocaleLowerCase("tr-TR");
  return PARTY_SLUG_ALIASES[key] ?? slugify(key);
}

async function getOrCreateParty(partyName, partyColor) {
  const name = partyName.trim();
  const slug = partySlug(name);
  let party = await prisma.party.findUnique({ where: { slug } });
  if (!party) {
    party = await prisma.party.create({
      data: { slug, name, color: partyColor || "#b9c5d1" },
    });
  }
  return party;
}

async function main() {
  if (!hasDatabaseUrl()) {
    skipMessage("migrate-election-parties");
    return;
  }

  const candidates = await prisma.electionCandidate.findMany({
    select: { id: true, partyName: true, partyColor: true, electionId: true },
  });

  let synced = 0;
  for (const candidate of candidates) {
    const party = await getOrCreateParty(candidate.partyName, candidate.partyColor);
    await prisma.electionCandidate.update({
      where: { id: candidate.id },
      data: { primaryPartyId: party.id },
    });
    await prisma.candidatePartySupport.upsert({
      where: {
        candidateId_partyId_role: {
          candidateId: candidate.id,
          partyId: party.id,
          role: "NOMINATING",
        },
      },
      create: {
        candidateId: candidate.id,
        partyId: party.id,
        role: "NOMINATING",
      },
      update: { validTo: null },
    });
    synced += 1;
  }

  const elections = await prisma.election.findMany({
    select: { id: true, electionDate: true, status: true },
  });

  let rounds = 0;
  for (const election of elections) {
    const roundStatus =
      election.status === "FINISHED"
        ? "FINAL"
        : election.status === "LIVE"
          ? "PROVISIONAL"
          : "SCHEDULED";

    await prisma.electionRound.upsert({
      where: { electionId_roundNumber: { electionId: election.id, roundNumber: 1 } },
      create: {
        electionId: election.id,
        roundNumber: 1,
        name: "1. Tur",
        electionDate: election.electionDate,
        status: roundStatus,
      },
      update: {},
    });
    rounds += 1;
  }

  await prisma.dataSource.findFirst({ where: { kind: "YSK_API" } }).then(async (existing) => {
    if (!existing) {
      await prisma.dataSource.create({
        data: { kind: "YSK_API", name: "YSK API", baseUrl: "https://www.ysk.gov.tr" },
      });
    }
  });

  console.log(JSON.stringify({ syncedCandidates: synced, electionRounds: rounds }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
