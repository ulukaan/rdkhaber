import type { PartySupportRole, Prisma, PrismaClient, RoundStatus } from "@prisma/client";
import { resolvePartyColor } from "@/lib/election-candidate-photo";
import { slugify } from "@/lib/slug";

type DbClient = Pick<
  PrismaClient,
  "party" | "electionCandidate" | "candidatePartySupport" | "electionRound" | "dataSource" | "person"
>;

const PARTY_SLUG_ALIASES: Record<string, string> = {
  "ak parti": "ak-parti",
  "akparti": "ak-parti",
  "adalet ve kalkinma partisi": "ak-parti",
  "chp": "chp",
  "cumhuriyet halk partisi": "chp",
  "mhp": "mhp",
  "milliyetci hareket partisi": "mhp",
  "iyi parti": "iyi-parti",
  "iyiparti": "iyi-parti",
  "dem parti": "dem-parti",
  "demokratik halklarin esitlik ve demokrasi partisi": "dem-parti",
  "yeniden refah": "yeniden-refah",
  "yeniden refah partisi": "yeniden-refah",
};

export function normalizePartyName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export function partySlugFromName(name: string) {
  const normalized = normalizePartyName(name).toLocaleLowerCase("tr-TR");
  if (PARTY_SLUG_ALIASES[normalized]) return PARTY_SLUG_ALIASES[normalized]!;
  return slugify(normalized);
}

export async function getOrCreateParty(
  db: DbClient,
  partyName: string,
  partyColor?: string,
) {
  const name = normalizePartyName(partyName);
  const slug = partySlugFromName(name);
  const color = partyColor?.trim() || resolvePartyColor(name);

  const existing = await db.party.findUnique({ where: { slug } });
  if (existing) {
    if (existing.color === "#b9c5d1" && color !== "#b9c5d1") {
      return db.party.update({ where: { id: existing.id }, data: { color, name } });
    }
    return existing;
  }

  return db.party.create({
    data: { slug, name, color },
  });
}

export async function syncNominatingPartySupport(
  db: DbClient,
  candidateId: string,
  partyName: string,
  partyColor?: string,
) {
  const party = await getOrCreateParty(db, partyName, partyColor);

  await db.electionCandidate.update({
    where: { id: candidateId },
    data: {
      primaryPartyId: party.id,
      partyName: party.name,
      partyColor: party.color,
    },
  });

  await db.candidatePartySupport.upsert({
    where: {
      candidateId_partyId_role: {
        candidateId,
        partyId: party.id,
        role: "NOMINATING",
      },
    },
    create: {
      candidateId,
      partyId: party.id,
      role: "NOMINATING",
    },
    update: {
      validTo: null,
    },
  });

  return party;
}

export async function ensurePersonForCandidate(
  db: DbClient,
  candidateId: string,
  fullName: string,
  photoUrl?: string | null,
  bio?: string | null,
) {
  const name = fullName.trim();
  if (!name) return null;

  const baseSlug = slugify(name);
  let person =
    (await db.person.findFirst({
      where: { OR: [{ slug: baseSlug }, { fullName: name }] },
    })) ?? null;

  if (!person) {
    person = await db.person.create({
      data: {
        fullName: name,
        slug: baseSlug,
        photoUrl: photoUrl?.trim() || null,
        bio: bio?.trim() || null,
      },
    });
  } else if (photoUrl?.trim() && !person.photoUrl) {
    person = await db.person.update({
      where: { id: person.id },
      data: { photoUrl: photoUrl.trim() },
    });
  }

  await db.electionCandidate.update({
    where: { id: candidateId },
    data: { personId: person.id },
  });

  return person;
}

export async function syncElectionCandidateParties(
  db: DbClient,
  electionId: string,
) {
  const candidates = await db.electionCandidate.findMany({
    where: { electionId },
    select: {
      id: true,
      name: true,
      partyName: true,
      partyColor: true,
      photoUrl: true,
      bio: true,
    },
  });

  for (const candidate of candidates) {
    await syncNominatingPartySupport(db, candidate.id, candidate.partyName, candidate.partyColor);
    await ensurePersonForCandidate(
      db,
      candidate.id,
      candidate.name,
      candidate.photoUrl,
      candidate.bio,
    );
  }
}

export async function ensureDefaultRound(
  db: DbClient,
  electionId: string,
  electionDate?: Date | null,
  status?: RoundStatus,
) {
  const existing = await db.electionRound.findUnique({
    where: { electionId_roundNumber: { electionId, roundNumber: 1 } },
  });
  if (existing) {
    const updates: { status?: typeof status; electionDate?: Date } = {};
    if (status && existing.status !== status) updates.status = status;
    if (electionDate && existing.electionDate?.getTime() !== electionDate.getTime()) {
      updates.electionDate = electionDate;
    }
    if (Object.keys(updates).length > 0) {
      return db.electionRound.update({ where: { id: existing.id }, data: updates });
    }
    return existing;
  }

  return db.electionRound.create({
    data: {
      electionId,
      roundNumber: 1,
      name: "1. Tur",
      electionDate: electionDate ?? undefined,
      status: status ?? "SCHEDULED",
    },
  });
}

export async function ensureYskDataSource(db: DbClient) {
  const existing = await db.dataSource.findFirst({ where: { kind: "YSK_API" } });
  if (existing) return existing;
  return db.dataSource.create({
    data: { kind: "YSK_API", name: "YSK API", baseUrl: "https://www.ysk.gov.tr" },
  });
}

export type CandidatePartyView = {
  partyId: string;
  partyName: string;
  partyColor: string;
  role: PartySupportRole;
};

export function mapCandidatePartySupports(
  supports: Array<{
    role: PartySupportRole;
    party: { id: string; name: string; color: string };
  }>,
): CandidatePartyView[] {
  return supports.map((item) => ({
    partyId: item.party.id,
    partyName: item.party.name,
    partyColor: item.party.color,
    role: item.role,
  }));
}
