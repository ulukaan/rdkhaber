import type {
  CountingSystem,
  PrismaClient,
  RoundStatus,
  SnapshotKind,
} from "@prisma/client";
import { computeBoxPct, computeVotePct } from "@/lib/election";
import { mergeVotesByAlliance, syncDefaultElectionAlliances } from "@/lib/election-alliance";
import { ensureDefaultRound, ensureYskDataSource } from "@/lib/election-party";

type DbClient = Pick<
  PrismaClient,
  | "election"
  | "electionRound"
  | "electionRuleSet"
  | "electionDistrict"
  | "electionCandidate"
  | "electionDistrictResult"
  | "geoUnit"
  | "pollingStation"
  | "resultSnapshot"
  | "resultImport"
  | "voteResult"
  | "seatAllocation"
  | "electionAlliance"
  | "electionAllianceMember"
  | "alliance"
  | "party"
  | "person"
  | "candidatePartySupport"
  | "dataSource"
  | "electionPeriod"
>;

const DEFAULT_COUNCIL_SEATS = 33;

const LOCAL_MAYOR_RULES: { name: string; system: CountingSystem; runoffThreshold: number } = {
  name: "Yerel belediye — çoğunluk / 2. tur",
  system: "TWO_ROUND_RUNOFF",
  runoffThreshold: 0.5,
};

const LOCAL_COUNCIL_RULES: { name: string; system: CountingSystem; seatCount: number } = {
  name: "İl genel meclisi — D'Hondt",
  system: "DHONDT",
  seatCount: DEFAULT_COUNCIL_SEATS,
};

export function roundStatusFromElectionStatus(
  status: "DRAFT" | "UPCOMING" | "LIVE" | "FINISHED",
): RoundStatus {
  if (status === "FINISHED") return "FINAL";
  if (status === "LIVE") return "PROVISIONAL";
  if (status === "UPCOMING") return "SCHEDULED";
  return "SCHEDULED";
}

export function snapshotKindFromElectionStatus(
  status: "DRAFT" | "UPCOMING" | "LIVE" | "FINISHED",
): SnapshotKind {
  if (status === "FINISHED") return "FINAL";
  if (status === "LIVE") return "PROVISIONAL";
  return "UPDATED";
}

export async function ensureLocalRuleSets(db: DbClient) {
  const mayor = await db.electionRuleSet.findFirst({ where: { system: "TWO_ROUND_RUNOFF" } });
  const council = await db.electionRuleSet.findFirst({ where: { system: "DHONDT" } });
  return {
    mayor:
      mayor ??
      (await db.electionRuleSet.create({
        data: LOCAL_MAYOR_RULES,
      })),
    council:
      council ??
      (await db.electionRuleSet.create({
        data: LOCAL_COUNCIL_RULES,
      })),
  };
}

export async function ensureElectionPeriod(
  db: DbClient,
  year: number,
  name = `${year} Yerel Seçimleri`,
) {
  const slug = `${year}-yerel`;
  const existing = await db.electionPeriod.findUnique({ where: { slug } });
  if (existing) return existing;
  return db.electionPeriod.create({
    data: { slug, name, year },
  });
}

export type DhondtEntry = { key: string; votes: number };

/** D'Hondt koltuk dağılımı — saf fonksiyon. */
export function computeDhondtSeats(entries: DhondtEntry[], seatCount: number) {
  const tallies = new Map(entries.map((e) => [e.key, { seats: 0, quotients: [] as number[] }]));

  for (let seat = 0; seat < seatCount; seat += 1) {
    let bestKey = "";
    let bestQuotient = -1;

    for (const entry of entries) {
      if (entry.votes <= 0) continue;
      const tally = tallies.get(entry.key)!;
      const quotient = entry.votes / (tally.seats + 1);
      if (quotient > bestQuotient) {
        bestQuotient = quotient;
        bestKey = entry.key;
      }
    }

    if (!bestKey) break;
    const winner = tallies.get(bestKey)!;
    winner.seats += 1;
    winner.quotients.push(bestQuotient);
  }

  return entries.map((entry) => ({
    key: entry.key,
    seats: tallies.get(entry.key)?.seats ?? 0,
    detail: tallies.get(entry.key)?.quotients ?? [],
  }));
}

async function allocateCouncilSeats(
  db: DbClient,
  snapshotId: string,
  roundId: string | undefined,
  candidates: Array<{
    id: string;
    raceType: string;
    votes: number;
    primaryPartyId: string | null;
    partyName: string;
  }>,
) {
  const council = candidates.filter((c) => c.raceType === "COUNCIL" && c.votes > 0);
  if (council.length === 0) return;

  const rules = await db.electionRuleSet.findFirst({ where: { system: "DHONDT" } });
  const seatCount = rules?.seatCount ?? DEFAULT_COUNCIL_SEATS;

  const partyVotes = new Map<string, { partyId: string | null; partyName: string; votes: number }>();
  for (const candidate of council) {
    const key = candidate.primaryPartyId ?? candidate.partyName.trim().toLocaleLowerCase("tr-TR");
    const existing = partyVotes.get(key);
    if (existing) {
      existing.votes += candidate.votes;
    } else {
      partyVotes.set(key, {
        partyId: candidate.primaryPartyId,
        partyName: candidate.partyName,
        votes: candidate.votes,
      });
    }
  }

  const partyToAlliance = new Map<string, { allianceId: string; displayName: string }>();
  if (roundId) {
    const alliances = await db.electionAlliance.findMany({
      where: { roundId, dissolvedAt: null },
      include: { members: { where: { leftAt: null } } },
    });
    for (const alliance of alliances) {
      for (const member of alliance.members) {
        partyToAlliance.set(member.partyId, {
          allianceId: alliance.id,
          displayName: alliance.displayName,
        });
      }
    }
  }

  const buckets = mergeVotesByAlliance([...partyVotes.values()], partyToAlliance);
  const allocations = computeDhondtSeats(
    buckets.map((b) => ({ key: b.key, votes: b.votes })),
    seatCount,
  );

  await db.seatAllocation.deleteMany({ where: { snapshotId } });
  for (const row of allocations) {
    if (row.seats <= 0) continue;
    const meta = buckets.find((b) => b.key === row.key);
    await db.seatAllocation.create({
      data: {
        snapshotId,
        ruleSetId: rules?.id,
        partyId: meta?.partyId ?? undefined,
        allianceId: meta?.allianceId ?? undefined,
        seats: row.seats,
        method: "DHONDT",
        detail: { quotients: row.detail, seatCount, label: meta?.label },
      },
    });
  }
}

export async function bootstrapElectionEngine(
  db: DbClient,
  electionId: string,
  options?: {
    provinceSlug?: string | null;
    provincePlateId?: number | null;
    electionDate?: Date | null;
    status?: "DRAFT" | "UPCOMING" | "LIVE" | "FINISHED";
    snapshot?: {
      kind?: SnapshotKind;
      label?: string;
      sourceUrl?: string;
      verified?: boolean;
      activate?: boolean;
    };
    skipSnapshot?: boolean;
  },
) {
  const election = await db.election.findUnique({ where: { id: electionId } });
  if (!election) return null;

  const year = (options?.electionDate ?? election.electionDate ?? new Date()).getFullYear();
  const period = await ensureElectionPeriod(db, year);
  const rules = await ensureLocalRuleSets(db);
  const roundStatus = roundStatusFromElectionStatus(options?.status ?? election.status);

  await db.election.update({
    where: { id: electionId },
    data: {
      periodId: election.periodId ?? period.id,
      scope: "LOCAL",
      provinceSlug: options?.provinceSlug ?? election.provinceSlug ?? "duzce",
      provincePlateId: options?.provincePlateId ?? election.provincePlateId ?? election.yskIlId ?? 81,
    },
  });

  const round = await ensureDefaultRound(
    db,
    electionId,
    options?.electionDate ?? election.electionDate,
    roundStatus,
  );

  if (!round.ruleSetId) {
    await db.electionRound.update({
      where: { id: round.id },
      data: { ruleSetId: rules.mayor.id },
    });
  }

  await syncGeoUnitsFromDistricts(db, electionId, round.id, options?.provincePlateId ?? election.yskIlId ?? 81);
  await syncDefaultElectionAlliances(db, round.id);

  if (!options?.skipSnapshot) {
    const snapshotKind =
      options?.snapshot?.kind ?? snapshotKindFromElectionStatus(options?.status ?? election.status);
    await publishElectionSnapshot(db, electionId, {
      kind: snapshotKind,
      label: options?.snapshot?.label ?? "Otomatik özet",
      activate: options?.snapshot?.activate ?? true,
      sourceUrl: options?.snapshot?.sourceUrl,
      verified: options?.snapshot?.verified,
    });
  }

  return { period, round, rules };
}

export async function syncGeoUnitsFromDistricts(
  db: DbClient,
  electionId: string,
  roundId: string,
  provincePlateId: number,
) {
  const districts = await db.electionDistrict.findMany({
    where: { electionId },
    orderBy: { order: "asc" },
  });

  let province = await db.geoUnit.findFirst({
    where: { roundId, level: "PROVINCE", slug: "province" },
  });
  if (!province) {
    province = await db.geoUnit.create({
      data: {
        roundId,
        level: "PROVINCE",
        name: "İl",
        slug: "province",
        plateId: provincePlateId,
        order: 0,
      },
    });
  }

  for (const district of districts) {
    const existing = await db.geoUnit.findFirst({
      where: { roundId, slug: district.slug, level: "DISTRICT" },
    });
    if (existing) {
      await db.geoUnit.update({
        where: { id: existing.id },
        data: {
          districtId: district.id,
          name: district.name,
          order: district.order,
          totalBoxes: district.totalBoxes,
          openBoxes: district.openBoxes,
          turnoutPct: district.turnoutPct,
        },
      });
      continue;
    }

    await db.geoUnit.create({
      data: {
        roundId,
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
    });
  }
}

export async function publishElectionSnapshot(
  db: DbClient,
  electionId: string,
  options: {
    kind: SnapshotKind;
    label?: string;
    activate?: boolean;
    importId?: string;
    sourceUrl?: string;
    importedBy?: string;
    verified?: boolean;
  },
) {
  const election = await db.election.findUnique({
    where: { id: electionId },
    include: {
      candidates: { orderBy: [{ raceType: "asc" }, { order: "asc" }] },
      districts: {
        orderBy: { order: "asc" },
        include: { results: true, geoUnit: true },
      },
      rounds: { where: { roundNumber: 1 }, take: 1 },
    },
  });
  if (!election) return null;

  const round = election.rounds[0];
  let importId = options.importId;

  if (!importId && options.sourceUrl) {
    const source = await ensureYskDataSource(db);
    const imp = await db.resultImport.create({
      data: {
        sourceId: source.id,
        electionId,
        sourceUrl: options.sourceUrl,
        importedBy: options.importedBy,
        verified: options.verified ?? false,
        verifiedAt: options.verified ? new Date() : null,
      },
    });
    importId = imp.id;
  }

  if (options.activate) {
    await db.resultSnapshot.updateMany({
      where: { electionId, isActive: true },
      data: { isActive: false },
    });
  }

  const snapshot = await db.resultSnapshot.create({
    data: {
      electionId,
      roundId: round?.id,
      importId,
      kind: options.kind,
      label: options.label,
      isActive: options.activate ?? false,
      totals: {
        totalBoxes: election.totalBoxes,
        openBoxes: election.openBoxes,
        totalVoters: election.totalVoters,
        usedVotes: election.usedVotes,
        validVotes: election.validVotes,
        boxPct: computeBoxPct(election.openBoxes, election.totalBoxes),
      },
    },
  });

  for (const candidate of election.candidates) {
    await db.voteResult.create({
      data: {
        snapshotId: snapshot.id,
        candidateId: candidate.id,
        votes: candidate.votes,
        votePct: candidate.votePct,
      },
    });

    for (const district of election.districts) {
      const districtResult = district.results.find((r) => r.candidateId === candidate.id);
      if (!districtResult || !district.geoUnit) continue;
      await db.voteResult.create({
        data: {
          snapshotId: snapshot.id,
          candidateId: candidate.id,
          geoUnitId: district.geoUnit.id,
          votes: districtResult.votes,
          votePct: districtResult.votePct,
        },
      });
    }
  }

  await allocateCouncilSeats(db, snapshot.id, round?.id, election.candidates);

  return snapshot;
}

export type CouncilSeatView = {
  label: string;
  seats: number;
  color: string;
  partyId: string | null;
  allianceId: string | null;
};

export async function getActiveCouncilSeats(electionId: string): Promise<CouncilSeatView[]> {
  const { prisma } = await import("@/lib/prisma");
  try {
    const snapshot = await prisma.resultSnapshot.findFirst({
      where: { electionId, isActive: true },
      select: { id: true },
    });
    if (!snapshot) return [];

    const rows = await prisma.seatAllocation.findMany({
      where: { snapshotId: snapshot.id },
      include: { party: true, alliance: true },
      orderBy: { seats: "desc" },
    });
    if (!rows.length) return [];

    return rows.map((row) => {
      const detail = row.detail as { label?: string } | null;
      const label = detail?.label ?? row.alliance?.displayName ?? row.party?.name ?? "Diğer";
      const color = row.alliance?.color ?? row.party?.color ?? "#b9c5d1";
      return {
        label,
        seats: row.seats,
        color,
        partyId: row.partyId,
        allianceId: row.allianceId,
      };
    });
  } catch {
    return [];
  }
}

const ROUND_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Planlandı",
  VOTING: "Oy kullanılıyor",
  COUNTING: "Sayım sürüyor",
  PROVISIONAL: "Ön sonuç",
  UPDATED: "Güncellendi",
  FINAL: "Kesin",
  CANCELLED: "İptal",
};

export type ElectionEngineSummary = {
  periodName: string | null;
  roundStatus: string | null;
  roundLabel: string | null;
  provinceSlug: string | null;
  provincePlateId: number | null;
  geoUnitCount: number;
  personLinkedCount: number;
  candidateCount: number;
  alliances: Array<{ id: string; name: string; color: string | null; parties: string[] }>;
  councilSeats: CouncilSeatView[];
};

export async function getElectionEngineSummary(electionId: string): Promise<ElectionEngineSummary | null> {
  const { prisma } = await import("@/lib/prisma");
  const election = await prisma.election.findUnique({
    where: { id: electionId },
    include: {
      period: true,
      rounds: {
        where: { roundNumber: 1 },
        take: 1,
        include: {
          alliances: {
            where: { dissolvedAt: null },
            include: {
              members: {
                where: { leftAt: null },
                include: { party: { select: { name: true } } },
              },
            },
          },
        },
      },
      candidates: { select: { personId: true } },
    },
  });
  if (!election) return null;

  const round = election.rounds[0];
  const geoUnitCount = round
    ? await prisma.geoUnit.count({ where: { roundId: round.id } })
    : 0;
  const councilSeats = await getActiveCouncilSeats(electionId);

  return {
    periodName: election.period?.name ?? null,
    roundStatus: round ? (ROUND_STATUS_LABELS[round.status] ?? round.status) : null,
    roundLabel: round?.name ?? null,
    provinceSlug: election.provinceSlug,
    provincePlateId: election.provincePlateId ?? election.yskIlId,
    geoUnitCount,
    personLinkedCount: election.candidates.filter((c) => c.personId).length,
    candidateCount: election.candidates.length,
    alliances: (round?.alliances ?? []).map((alliance) => ({
      id: alliance.id,
      name: alliance.displayName,
      color: alliance.color,
      parties: alliance.members.map((m) => m.party.name),
    })),
    councilSeats,
  };
}

export async function getActiveSnapshotMeta(electionId: string) {
  const { prisma } = await import("@/lib/prisma");
  const snapshot = await prisma.resultSnapshot.findFirst({
    where: { electionId, isActive: true },
    orderBy: { publishedAt: "desc" },
    include: {
      import: { include: { source: true } },
    },
  });
  if (!snapshot) return null;

  return {
    kind: snapshot.kind,
    label: snapshot.label,
    publishedAt: snapshot.publishedAt,
    verified: snapshot.import?.verified ?? false,
    sourceName: snapshot.import?.source.name ?? "Sistem",
    sourceUrl: snapshot.import?.sourceUrl ?? snapshot.import?.source.baseUrl,
    importedAt: snapshot.import?.importedAt ?? snapshot.publishedAt,
  };
}

export async function verifyActiveSnapshotAction(electionId: string, userId: string) {
  const { prisma } = await import("@/lib/prisma");
  const snapshot = await prisma.resultSnapshot.findFirst({
    where: { electionId, isActive: true },
    include: { import: true },
  });
  if (!snapshot?.import) return { error: "Doğrulanacak içe aktarım yok." };

  await prisma.resultImport.update({
    where: { id: snapshot.import.id },
    data: {
      verified: true,
      verifiedAt: new Date(),
      verifiedBy: userId,
    },
  });

  await prisma.resultSnapshot.update({
    where: { id: snapshot.id },
    data: { kind: "FINAL" },
  });

  await prisma.electionRound.updateMany({
    where: { electionId, roundNumber: 1 },
    data: { status: "FINAL" },
  });

  return { success: true };
}

/** Materialized candidate totals from active snapshot (fallback: election row). */
export function materializeCandidateTotals(
  candidates: Array<{ id: string; votes: number; votePct: number }>,
  validVotes: number,
) {
  return candidates.map((c) => ({
    ...c,
    votePct: validVotes > 0 ? computeVotePct(c.votes, validVotes) : c.votePct,
  }));
}
