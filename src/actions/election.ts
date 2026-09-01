"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { revalidatePublicSite } from "@/lib/revalidate-site";
import { computeVotePct, DUZCE_DISTRICTS } from "@/lib/election";
import { electionSchema } from "@/lib/validation";
import { slugify } from "@/lib/slug";

function parseElectionDate(raw: string | undefined) {
  const value = raw?.trim();
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function normalizeImageUrl(raw: string | undefined) {
  const value = raw?.trim();
  return value ? value : null;
}

function revalidateElectionPaths(slug: string) {
  revalidatePath("/admin/secim");
  revalidatePath(`/admin/secim/${slug}`);
  revalidatePath("/secim");
  revalidatePublicSite();
}

async function ensureSinglePrimary(electionId: string, isPrimary: boolean) {
  if (!isPrimary) return;
  await prisma.election.updateMany({
    where: { id: { not: electionId }, isPrimary: true },
    data: { isPrimary: false },
  });
}

function recalcCandidatePcts<T extends { votes: number; votePct?: number }>(
  candidates: T[],
  validVotes: number,
): T[] {
  return candidates.map((candidate) => ({
    ...candidate,
    votePct: computeVotePct(candidate.votes, validVotes),
  }));
}

export async function createElectionAction(raw: unknown) {
  await requireRole(["ADMIN"]);
  const parsed = electionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz veri." };
  }

  const data = parsed.data;
  const slug = data.slug.trim() || slugify(data.title);
  const exists = await prisma.election.findUnique({ where: { slug }, select: { id: true } });
  if (exists) return { error: "Bu adres (slug) zaten kullanılıyor." };

  const candidates = recalcCandidatePcts(data.candidates, data.validVotes);
  const districts =
    data.districts.length > 0
      ? data.districts
      : DUZCE_DISTRICTS.map((d, order) => ({
          name: d.name,
          slug: d.slug,
          order,
          totalBoxes: 0,
          openBoxes: 0,
          turnoutPct: 0,
          results: [],
        }));

  const election = await prisma.$transaction(async (tx) => {
    const created = await tx.election.create({
      data: {
        slug,
        title: data.title.trim(),
        subtitle: data.subtitle?.trim() || null,
        electionDate: parseElectionDate(data.electionDate),
        status: data.status,
        showOnHome: data.showOnHome,
        isPrimary: data.isPrimary,
        liveRefreshSec: data.liveRefreshSec,
        totalBoxes: data.totalBoxes,
        openBoxes: data.openBoxes,
        totalVoters: data.totalVoters,
        usedVotes: data.usedVotes,
        validVotes: data.validVotes,
        categorySlug: data.categorySlug?.trim() || null,
        lastResultsAt: data.status === "LIVE" ? new Date() : null,
        candidates: {
          create: candidates.map((candidate, order) => ({
            raceType: candidate.raceType,
            name: candidate.name.trim(),
            partyName: candidate.partyName.trim(),
            partyColor: candidate.partyColor,
            photoUrl: normalizeImageUrl(candidate.photoUrl),
            slogan: candidate.slogan?.trim() || null,
            bio: candidate.bio?.trim() || null,
            votes: candidate.votes,
            votePct: candidate.votePct ?? 0,
            prevVotes: candidate.prevVotes ?? null,
            prevVotePct: candidate.prevVotePct ?? null,
            order,
          })),
        },
        districts: {
          create: districts.map((district) => ({
            name: district.name.trim(),
            slug: district.slug.trim(),
            order: district.order,
            totalBoxes: district.totalBoxes,
            openBoxes: district.openBoxes,
            turnoutPct: district.turnoutPct,
          })),
        },
      },
      include: { candidates: true, districts: true },
    });

    if (data.isPrimary) {
      await tx.election.updateMany({
        where: { id: { not: created.id }, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return created;
  });

  revalidateElectionPaths(election.slug);
  return { success: true, id: election.id, slug: election.slug };
}

export async function updateElectionAction(id: string, raw: unknown) {
  await requireRole(["ADMIN"]);
  const parsed = electionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz veri." };
  }

  const existing = await prisma.election.findUnique({
    where: { id },
    include: { candidates: true, districts: { include: { results: true } } },
  });
  if (!existing) return { error: "Seçim bulunamadı." };

  const data = parsed.data;
  const slug = data.slug.trim();
  const slugConflict = await prisma.election.findFirst({
    where: { slug, id: { not: id } },
    select: { id: true },
  });
  if (slugConflict) return { error: "Bu adres (slug) zaten kullanılıyor." };

  const candidates = recalcCandidatePcts(data.candidates, data.validVotes);

  await prisma.$transaction(async (tx) => {
    await tx.election.update({
      where: { id },
      data: {
        slug,
        title: data.title.trim(),
        subtitle: data.subtitle?.trim() || null,
        electionDate: parseElectionDate(data.electionDate),
        status: data.status,
        showOnHome: data.showOnHome,
        isPrimary: data.isPrimary,
        liveRefreshSec: data.liveRefreshSec,
        totalBoxes: data.totalBoxes,
        openBoxes: data.openBoxes,
        totalVoters: data.totalVoters,
        usedVotes: data.usedVotes,
        validVotes: data.validVotes,
        categorySlug: data.categorySlug?.trim() || null,
        lastResultsAt: data.status === "LIVE" || data.status === "FINISHED" ? new Date() : existing.lastResultsAt,
      },
    });

    if (data.isPrimary) {
      await tx.election.updateMany({
        where: { id: { not: id }, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const keptCandidateIds: string[] = [];
    for (let index = 0; index < candidates.length; index += 1) {
      const candidate = candidates[index]!;
      const rawCandidate = data.candidates[index];
      const existingCandidate = rawCandidate?.id
        ? existing.candidates.find((item) => item.id === rawCandidate.id)
        : existing.candidates[index];

      if (existingCandidate) {
        keptCandidateIds.push(existingCandidate.id);
        await tx.electionCandidate.update({
          where: { id: existingCandidate.id },
          data: {
            raceType: candidate.raceType,
            name: candidate.name.trim(),
            partyName: candidate.partyName.trim(),
            partyColor: candidate.partyColor,
            photoUrl: normalizeImageUrl(candidate.photoUrl),
            slogan: candidate.slogan?.trim() || null,
            bio: candidate.bio?.trim() || null,
            votes: candidate.votes,
            votePct: candidate.votePct ?? 0,
            prevVotes: candidate.prevVotes ?? null,
            prevVotePct: candidate.prevVotePct ?? null,
            order: index,
          },
        });
      } else {
        const created = await tx.electionCandidate.create({
          data: {
            electionId: id,
            raceType: candidate.raceType,
            name: candidate.name.trim(),
            partyName: candidate.partyName.trim(),
            partyColor: candidate.partyColor,
            photoUrl: normalizeImageUrl(candidate.photoUrl),
            slogan: candidate.slogan?.trim() || null,
            bio: candidate.bio?.trim() || null,
            votes: candidate.votes,
            votePct: candidate.votePct ?? 0,
            prevVotes: candidate.prevVotes ?? null,
            prevVotePct: candidate.prevVotePct ?? null,
            order: index,
          },
        });
        keptCandidateIds.push(created.id);
      }
    }

    await tx.electionCandidate.deleteMany({
      where: { electionId: id, id: { notIn: keptCandidateIds } },
    });

    const refreshedCandidates = await tx.electionCandidate.findMany({
      where: { electionId: id },
      orderBy: { order: "asc" },
    });
    const candidateByKey = new Map(
      data.candidates.map((item, index) => [
        item.id ?? `new-${index}`,
        refreshedCandidates[index]?.id,
      ]),
    );

    const keptDistrictIds: string[] = [];
    for (const district of data.districts) {
      const existingDistrict = district.id
        ? existing.districts.find((item) => item.id === district.id)
        : existing.districts.find((item) => item.slug === district.slug);

      let districtId: string;
      if (existingDistrict) {
        districtId = existingDistrict.id;
        keptDistrictIds.push(districtId);
        await tx.electionDistrict.update({
          where: { id: districtId },
          data: {
            name: district.name.trim(),
            slug: district.slug.trim(),
            order: district.order,
            totalBoxes: district.totalBoxes,
            openBoxes: district.openBoxes,
            turnoutPct: district.turnoutPct,
          },
        });
      } else {
        const createdDistrict = await tx.electionDistrict.create({
          data: {
            electionId: id,
            name: district.name.trim(),
            slug: district.slug.trim(),
            order: district.order,
            totalBoxes: district.totalBoxes,
            openBoxes: district.openBoxes,
            turnoutPct: district.turnoutPct,
          },
        });
        districtId = createdDistrict.id;
        keptDistrictIds.push(districtId);
      }

      await tx.electionDistrictResult.deleteMany({ where: { districtId } });
      for (const result of district.results ?? []) {
        const candidateId = candidateByKey.get(result.candidateKey);
        if (!candidateId) continue;
        await tx.electionDistrictResult.create({
          data: {
            districtId,
            candidateId,
            votes: result.votes,
            votePct: result.votePct,
          },
        });
      }
    }

    await tx.electionDistrict.deleteMany({
      where: { electionId: id, id: { notIn: keptDistrictIds } },
    });
  });

  revalidateElectionPaths(slug);
  return { success: true };
}

export async function deleteElectionAction(id: string) {
  await requireRole(["ADMIN"]);
  const election = await prisma.election.findUnique({ where: { id }, select: { slug: true } });
  if (!election) return { error: "Seçim bulunamadı." };
  await prisma.election.delete({ where: { id } });
  revalidateElectionPaths(election.slug);
  return { success: true };
}

export async function setPrimaryElectionAction(id: string) {
  await requireRole(["ADMIN"]);
  const election = await prisma.election.update({
    where: { id },
    data: { isPrimary: true },
    select: { slug: true },
  });
  await ensureSinglePrimary(id, true);
  revalidateElectionPaths(election.slug);
  return { success: true };
}
