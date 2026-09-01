import type { PrismaClient } from "@prisma/client";
import { slugify } from "@/lib/slug";

type DbClient = Pick<PrismaClient, "party" | "alliance" | "electionAlliance" | "electionAllianceMember">;

/** Yerel seçimlerde yaygın ittifak şablonları (parti slug listesi). */
export const DEFAULT_LOCAL_ALLIANCES: Array<{
  slug: string;
  name: string;
  color: string;
  partySlugs: string[];
}> = [
  {
    slug: "cumhur-ittifaki",
    name: "Cumhur İttifakı",
    color: "#ff8500",
    partySlugs: ["ak-parti", "mhp"],
  },
  {
    slug: "millet-ittifaki",
    name: "Millet İttifakı",
    color: "#e30a17",
    partySlugs: ["chp", "iyi-parti"],
  },
];

export async function syncDefaultElectionAlliances(db: DbClient, roundId: string) {
  for (const template of DEFAULT_LOCAL_ALLIANCES) {
    const parties = await db.party.findMany({
      where: { slug: { in: template.partySlugs } },
      select: { id: true, slug: true },
    });
    if (parties.length < 2) continue;

    const master =
      (await db.alliance.findUnique({ where: { slug: template.slug } })) ??
      (await db.alliance.create({
        data: { slug: template.slug, name: template.name },
      }));

    const existing = await db.electionAlliance.findFirst({
      where: { roundId, allianceId: master.id, dissolvedAt: null },
    });

    const electionAlliance =
      existing ??
      (await db.electionAlliance.create({
        data: {
          roundId,
          allianceId: master.id,
          displayName: template.name,
          color: template.color,
        },
      }));

    for (const party of parties) {
      await db.electionAllianceMember.upsert({
        where: {
          allianceId_partyId: {
            allianceId: electionAlliance.id,
            partyId: party.id,
          },
        },
        create: {
          allianceId: electionAlliance.id,
          partyId: party.id,
        },
        update: { leftAt: null },
      });
    }
  }
}

export type AllianceVoteBucket = {
  key: string;
  votes: number;
  partyId: string | null;
  allianceId: string | null;
  label: string;
};

/** Parti oylarını aktif ittifaklara göre birleştirir. */
export function mergeVotesByAlliance(
  partyVotes: Array<{ partyId: string | null; partyName: string; votes: number }>,
  partyToAlliance: Map<string, { allianceId: string; displayName: string }>,
): AllianceVoteBucket[] {
  const buckets = new Map<string, AllianceVoteBucket>();

  for (const row of partyVotes) {
    const alliance = row.partyId ? partyToAlliance.get(row.partyId) : undefined;
    const key = alliance
      ? `alliance:${alliance.allianceId}`
      : row.partyId ?? row.partyName.trim().toLocaleLowerCase("tr-TR");

    const existing = buckets.get(key);
    if (existing) {
      existing.votes += row.votes;
      continue;
    }

    buckets.set(key, {
      key,
      votes: row.votes,
      partyId: alliance ? null : row.partyId,
      allianceId: alliance?.allianceId ?? null,
      label: alliance?.displayName ?? row.partyName,
    });
  }

  return [...buckets.values()];
}
