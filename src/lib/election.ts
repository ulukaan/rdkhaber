import { cache } from "react";
import type { ElectionRaceType, ElectionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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
  CHP: "#e30a17",
  "AK Parti": "#ff9d00",
  MHP: "#c1121f",
  "İYİ Parti": "#0099ff",
  "DEM Parti": "#7c3aed",
  "Yeniden Refah": "#006400",
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
  const election = await getPrimaryElection();
  if (!election || !election.showOnHome) return null;
  const mayorLeader = election.candidates
    .filter((item) => item.raceType === "MAYOR")
    .sort((a, b) => b.votes - a.votes)[0];
  return {
    title: election.title,
    subtitle: election.subtitle,
    slug: election.slug,
    boxPct: computeBoxPct(election.openBoxes, election.totalBoxes),
    leadingName: mayorLeader?.name,
    leadingPct: mayorLeader?.votePct,
  };
}
