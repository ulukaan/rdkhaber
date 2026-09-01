/**
 * Seçim veri motoru — tam backfill (faz 1-6).
 * node scripts/migrate-election-engine.mjs
 */
import { PrismaClient } from "@prisma/client";
import { hasDatabaseUrl, skipMessage } from "./ensure-db-utils.mjs";

const prisma = new PrismaClient();

const PARTY_SLUG_ALIASES = {
  "ak parti": "ak-parti",
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

async function ensureRuleSets() {
  let mayor = await prisma.electionRuleSet.findFirst({ where: { system: "TWO_ROUND_RUNOFF" } });
  if (!mayor) {
    mayor = await prisma.electionRuleSet.create({
      data: { name: "Yerel belediye — çoğunluk / 2. tur", system: "TWO_ROUND_RUNOFF", runoffThreshold: 0.5 },
    });
  }
  let council = await prisma.electionRuleSet.findFirst({ where: { system: "DHONDT" } });
  if (!council) {
    council = await prisma.electionRuleSet.create({
      data: { name: "İl genel meclisi — D'Hondt", system: "DHONDT", seatCount: 33 },
    });
  }
  return { mayor, council };
}

async function main() {
  if (!hasDatabaseUrl()) {
    skipMessage("migrate-election-engine");
    return;
  }

  await ensureRuleSets();

  const source = await prisma.dataSource.findFirst({ where: { kind: "YSK_API" } }).then(async (s) => {
    if (s) return s;
    return prisma.dataSource.create({
      data: { kind: "YSK_API", name: "YSK API", baseUrl: "https://www.ysk.gov.tr" },
    });
  });

  const candidates = await prisma.electionCandidate.findMany({
    select: { id: true, partyName: true, partyColor: true, electionId: true, name: true },
  });

  let partyLinks = 0;
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
      create: { candidateId: candidate.id, partyId: party.id, role: "NOMINATING" },
      update: { validTo: null },
    });

    const personSlug = slugify(candidate.name);
    let person = await prisma.person.findFirst({
      where: { OR: [{ slug: personSlug }, { fullName: candidate.name }] },
    });
    if (!person) {
      person = await prisma.person.create({
        data: { fullName: candidate.name, slug: personSlug },
      });
    }
    await prisma.electionCandidate.update({
      where: { id: candidate.id },
      data: { personId: person.id },
    });

    partyLinks += 1;
  }

  const elections = await prisma.election.findMany({
    include: {
      candidates: { include: { districtResults: true } },
      districts: { include: { results: true } },
    },
  });

  const year = new Date().getFullYear();
  const period =
    (await prisma.electionPeriod.findUnique({ where: { slug: `${year}-yerel` } })) ??
    (await prisma.electionPeriod.create({
      data: { slug: `${year}-yerel`, name: `${year} Yerel Seçimleri`, year },
    }));

  const rules = await ensureRuleSets();
  let engines = 0;

  for (const election of elections) {
    const roundStatus =
      election.status === "FINISHED" ? "FINAL" : election.status === "LIVE" ? "PROVISIONAL" : "SCHEDULED";

    await prisma.election.update({
      where: { id: election.id },
      data: {
        periodId: period.id,
        scope: "LOCAL",
        provinceSlug: election.provinceSlug ?? "duzce",
        provincePlateId: election.provincePlateId ?? election.yskIlId ?? 81,
      },
    });

    const round = await prisma.electionRound.upsert({
      where: { electionId_roundNumber: { electionId: election.id, roundNumber: 1 } },
      create: {
        electionId: election.id,
        roundNumber: 1,
        name: "1. Tur",
        electionDate: election.electionDate,
        status: roundStatus,
        ruleSetId: rules.mayor.id,
      },
      update: { ruleSetId: rules.mayor.id, status: roundStatus },
    });

    const ALLIANCE_TEMPLATES = [
      { slug: "cumhur-ittifaki", name: "Cumhur İttifakı", color: "#ff8500", parties: ["ak-parti", "mhp"] },
      { slug: "millet-ittifaki", name: "Millet İttifakı", color: "#e30a17", parties: ["chp", "iyi-parti"] },
    ];
    for (const template of ALLIANCE_TEMPLATES) {
      const memberParties = await prisma.party.findMany({ where: { slug: { in: template.parties } } });
      if (memberParties.length < 2) continue;
      const master =
        (await prisma.alliance.findUnique({ where: { slug: template.slug } })) ??
        (await prisma.alliance.create({ data: { slug: template.slug, name: template.name } }));
      const electionAlliance =
        (await prisma.electionAlliance.findFirst({ where: { roundId: round.id, allianceId: master.id } })) ??
        (await prisma.electionAlliance.create({
          data: { roundId: round.id, allianceId: master.id, displayName: template.name, color: template.color },
        }));
      for (const party of memberParties) {
        await prisma.electionAllianceMember.upsert({
          where: { allianceId_partyId: { allianceId: electionAlliance.id, partyId: party.id } },
          create: { allianceId: electionAlliance.id, partyId: party.id },
          update: { leftAt: null },
        });
      }
    }

    let province = await prisma.geoUnit.findFirst({
      where: { roundId: round.id, level: "PROVINCE" },
    });
    if (!province) {
      province = await prisma.geoUnit.create({
        data: {
          roundId: round.id,
          level: "PROVINCE",
          name: "İl",
          slug: "province",
          plateId: election.yskIlId ?? 81,
        },
      });
    }

    for (const district of election.districts) {
      const geo = await prisma.geoUnit.upsert({
        where: { districtId: district.id },
        create: {
          roundId: round.id,
          parentId: province.id,
          districtId: district.id,
          level: "DISTRICT",
          name: district.name,
          slug: district.slug,
          order: district.order,
          totalBoxes: district.totalBoxes,
          openBoxes: district.openBoxes,
          turnoutPct: district.turnoutPct,
        },
        update: {
          name: district.name,
          totalBoxes: district.totalBoxes,
          openBoxes: district.openBoxes,
          turnoutPct: district.turnoutPct,
        },
      });

      if (district.totalBoxes > 0) {
        await prisma.pollingStation.upsert({
          where: { geoUnitId_boxNumber: { geoUnitId: geo.id, boxNumber: 1 } },
          create: {
            geoUnitId: geo.id,
            boxNumber: 1,
            totalVoters: district.totalBoxes * 300,
          },
          update: {},
        });
      }
    }

    await prisma.resultSnapshot.updateMany({
      where: { electionId: election.id, isActive: true },
      data: { isActive: false },
    });

    const imp = await prisma.resultImport.create({
      data: {
        sourceId: source.id,
        electionId: election.id,
        sourceUrl: "https://www.ysk.gov.tr",
        verified: election.status === "FINISHED",
        verifiedAt: election.status === "FINISHED" ? new Date() : null,
      },
    });

    const snapshot = await prisma.resultSnapshot.create({
      data: {
        electionId: election.id,
        roundId: round.id,
        importId: imp.id,
        kind: election.status === "FINISHED" ? "FINAL" : election.status === "LIVE" ? "PROVISIONAL" : "UPDATED",
        label: "Migrasyon özeti",
        isActive: true,
        totals: {
          totalBoxes: election.totalBoxes,
          openBoxes: election.openBoxes,
          validVotes: election.validVotes,
        },
      },
    });

    for (const candidate of election.candidates) {
      await prisma.voteResult.create({
        data: {
          snapshotId: snapshot.id,
          candidateId: candidate.id,
          votes: candidate.votes,
          votePct: candidate.votePct,
        },
      });

      for (const district of election.districts) {
        const result = district.results.find((r) => r.candidateId === candidate.id);
        if (!result) continue;
        const geo = await prisma.geoUnit.findUnique({ where: { districtId: district.id } });
        if (!geo) continue;
        await prisma.voteResult.create({
          data: {
            snapshotId: snapshot.id,
            candidateId: candidate.id,
            geoUnitId: geo.id,
            votes: result.votes,
            votePct: result.votePct,
          },
        });
      }
    }

    engines += 1;
  }

  console.log(JSON.stringify({ partyLinks, elections: engines, period: period.slug }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
