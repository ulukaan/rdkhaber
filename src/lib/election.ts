import { cache } from "react";
import type { ElectionRaceType, ElectionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveNtvDistrictId, resolvePartyColor } from "@/lib/election-candidate-photo";
import { DUZCE_2024_DISTRICT_LEADERS } from "@/lib/election-duzce-data";

export const DUZCE_DISTRICTS = [
  { name: "Merkez", slug: "merkez" },
  { name: "Akçakoca", slug: "akcakoca" },
  { name: "Cumayeri", slug: "cumayeri" },
  { name: "Çilimli", slug: "cilimli" },
  { name: "Gölyaka", slug: "golyaka" },
  { name: "Gümüşova", slug: "gumusova" },
  { name: "Kaynaşlı", slug: "kaynasli" },
  { name: "Yığılca", slug: "yigilca" },
] as const;

export const ELECTION_STATUS_LABELS: Record<ElectionStatus, string> = {
  DRAFT: "Taslak",
  UPCOMING: "Yaklaşıyor",
  LIVE: "Canlı",
  FINISHED: "Tamamlandı",
};

export const RACE_TYPE_LABELS: Record<ElectionRaceType, string> = {
  MAYOR: "Belediye Başkanlığı",
  COUNCIL: "İl Genel Meclisi",
};

export const DEFAULT_PARTY_COLORS: Record<string, string> = {
  CHP: resolvePartyColor("CHP"),
  "AK Parti": resolvePartyColor("AK Parti"),
  MHP: resolvePartyColor("MHP"),
  "İYİ Parti": resolvePartyColor("İYİ Parti"),
  "DEM Parti": resolvePartyColor("DEM Parti"),
  "Yeniden Refah": resolvePartyColor("Yeniden Refah"),
};

export function formatElectionPercent(value: number) {
  return `%${value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatElectionCount(value: number) {
  return value.toLocaleString("tr-TR");
}

export function computeVotePct(votes: number, validVotes: number) {
  if (validVotes <= 0) return 0;
  return Math.round((votes / validVotes) * 10000) / 100;
}

export function computeBoxPct(openBoxes: number, totalBoxes: number) {
  if (totalBoxes <= 0) return 0;
  return Math.round((openBoxes / totalBoxes) * 10000) / 100;
}

export function computeVoteGap(sortedByVotes: Array<{ votes: number }>) {
  if (sortedByVotes.length < 2) return sortedByVotes[0]?.votes ?? 0;
  return sortedByVotes[0]!.votes - sortedByVotes[1]!.votes;
}

export type ElectionPublicPayload = NonNullable<Awaited<ReturnType<typeof getElectionBySlug>>>;

const electionPageInclude = {
  candidates: {
    orderBy: [{ raceType: "asc" as const }, { order: "asc" as const }],
    include: {
      primaryParty: true,
      partySupports: {
        where: { validTo: null },
        include: { party: true },
        orderBy: { role: "asc" as const },
      },
    },
  },
  districts: {
    orderBy: { order: "asc" as const },
    include: {
      results: {
        include: {
          candidate: {
            select: { id: true, name: true, partyName: true, partyColor: true, raceType: true },
          },
        },
      },
    },
  },
  rounds: { orderBy: { roundNumber: "asc" as const } },
};

export type SecimPageMode = "live" | "upcoming" | "archive";

/** /secim: önce canlı/yaklaşan birincil seçim, yoksa tamamlanmış arşiv. */
export const getSecimPageElection = cache(async () => {
  const active = await prisma.election.findFirst({
    where: { isPrimary: true, status: { in: ["LIVE", "UPCOMING"] } },
    include: electionPageInclude,
  });
  if (active) {
    return {
      election: active,
      mode: active.status === "LIVE" ? ("live" as const) : ("upcoming" as const),
    };
  }

  const archivedPrimary = await prisma.election.findFirst({
    where: { isPrimary: true, status: "FINISHED" },
    include: electionPageInclude,
  });
  if (archivedPrimary) {
    return { election: archivedPrimary, mode: "archive" as const };
  }

  const latestFinished = await prisma.election.findFirst({
    where: { status: "FINISHED" },
    orderBy: [{ electionDate: "desc" }, { updatedAt: "desc" }],
    include: electionPageInclude,
  });
  if (latestFinished) {
    return { election: latestFinished, mode: "archive" as const };
  }

  return null;
});

export const getElectionBySlug = cache(async (slug: string) => {
  const election = await prisma.election.findUnique({
    where: { slug },
    include: {
      candidates: { orderBy: [{ raceType: "asc" }, { order: "asc" }] },
      districts: {
        orderBy: { order: "asc" },
        include: {
          results: {
            include: { candidate: { select: { id: true, name: true, partyName: true, partyColor: true, raceType: true } } },
          },
        },
      },
    },
  });
  if (!election || election.status === "DRAFT") return null;
  return election;
});

export const getPrimaryElection = cache(async () => {
  const election = await prisma.election.findFirst({
    where: {
      isPrimary: true,
      status: { in: ["UPCOMING", "LIVE", "FINISHED"] },
    },
    include: electionPageInclude,
  });
  return election;
});

export async function getElectionNewsArticles(categorySlug: string | null, limit = 6) {
  if (!categorySlug?.trim()) return [];
  const category = await prisma.category.findFirst({
    where: { slug: categorySlug.trim() },
    select: { id: true },
  });
  if (!category) return [];
  return prisma.article.findMany({
    where: { status: "PUBLISHED", categoryId: category.id },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      coverImageUrl: true,
      publishedAt: true,
    },
  });
}

export async function getElectionStripData() {
  const data = await getElectionHomeTopBarData();
  if (!data) return null;
  const leader = data.candidates[0];
  return {
    title: data.title,
    subtitle: data.subtitle,
    slug: data.slug,
    boxPct: data.boxPct,
    leadingName: leader?.name,
    leadingPct: leader?.votePct,
  };
}

export type ElectionHomeTopBarCandidate = {
  name: string;
  partyName: string;
  partyColor: string;
  photoUrl: string | null;
  votes: number;
  votePct: number;
};

export type ElectionHomeTopBarDistrictLeader = {
  districtName: string;
  districtSlug: string;
  name: string;
  partyName: string;
  partyColor: string;
  votePct: number;
  votes: number;
};

export async function getElectionHomeTopBarData() {
  const election = await getPrimaryElection();
  if (!election || !election.showOnHome) return null;

  const candidates = election.candidates
    .filter((item) => item.raceType === "MAYOR")
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 3)
    .map((candidate) => ({
      name: candidate.name,
      partyName: candidate.partyName,
      partyColor: resolvePartyColor(candidate.partyName, candidate.partyColor),
      photoUrl: candidate.photoUrl,
      votes: candidate.votes,
      votePct:
        election.validVotes > 0
          ? computeVotePct(candidate.votes, election.validVotes)
          : candidate.votePct,
    }));

  if (candidates.length === 0) return null;

  const districtLeaders = election.districts
    .filter((district) => district.slug !== "merkez")
    .map((district) => {
      const mayorResults = district.results
        .filter((result) => result.candidate.raceType === "MAYOR")
        .sort((a, b) => b.votes - a.votes);
      const leader = mayorResults[0];
      const fallback = DUZCE_2024_DISTRICT_LEADERS[district.slug];
      const name = leader?.candidate.name ?? fallback?.leadingName;
      const partyName = leader?.candidate.partyName ?? fallback?.leadingParty;
      if (!name || !partyName) return null;
      return {
        districtName: district.name,
        districtSlug: district.slug,
        name,
        partyName,
        partyColor: resolvePartyColor(
          partyName,
          leader?.candidate.partyColor ?? fallback?.leadingPartyColor,
        ),
        votePct: leader?.votePct ?? fallback?.leadingPct ?? 0,
        votes: leader?.votes ?? fallback?.leadingVotes ?? 0,
      };
    })
    .filter((item): item is ElectionHomeTopBarDistrictLeader => item != null)
    .sort((a, b) => a.districtName.localeCompare(b.districtName, "tr"));

  return {
    title: election.title,
    subtitle: election.subtitle,
    status: election.status,
    slug: election.slug,
    boxPct: computeBoxPct(election.openBoxes, election.totalBoxes),
    ntvCityId: election.yskIlId ?? 81,
    ntvDistrictId: resolveNtvDistrictId(election.yskIlId ?? 81),
    candidates,
    districtLeaders,
    href: "/secim",
  };
}
