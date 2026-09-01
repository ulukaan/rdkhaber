import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { ElectionForm, type ElectionFormDefaults } from "@/components/admin/ElectionForm";
import { ElectionYskPanel } from "@/components/admin/ElectionYskPanel";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const election = await prisma.election.findUnique({ where: { id }, select: { title: true } });
  return { title: election?.title ?? "Seçim düzenle" };
}

function toDatetimeLocal(value: Date | null) {
  if (!value) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export default async function EditElectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const election = await prisma.election.findUnique({
    where: { id },
    include: {
      candidates: { orderBy: { order: "asc" } },
      districts: { orderBy: { order: "asc" } },
    },
  });
  if (!election) notFound();

  const defaults: ElectionFormDefaults = {
    id: election.id,
    slug: election.slug,
    title: election.title,
    subtitle: election.subtitle ?? "",
    electionDate: toDatetimeLocal(election.electionDate),
    status: election.status,
    showOnHome: election.showOnHome,
    isPrimary: election.isPrimary,
    liveRefreshSec: election.liveRefreshSec,
    totalBoxes: election.totalBoxes,
    openBoxes: election.openBoxes,
    totalVoters: election.totalVoters,
    usedVotes: election.usedVotes,
    validVotes: election.validVotes,
    categorySlug: election.categorySlug ?? "",
    yskSecimId: election.yskSecimId ?? "",
    yskSecimTuru: election.yskSecimTuru ?? "",
    yskIlId: election.yskIlId ?? "",
    yskFocusIlce: election.yskFocusIlce ?? "",
    yskSyncEnabled: election.yskSyncEnabled,
    candidates: election.candidates.map((candidate) => ({
      id: candidate.id,
      raceType: candidate.raceType,
      name: candidate.name,
      partyName: candidate.partyName,
      partyColor: candidate.partyColor,
      photoUrl: candidate.photoUrl ?? "",
      slogan: candidate.slogan ?? "",
      bio: candidate.bio ?? "",
      votes: candidate.votes,
      votePct: candidate.votePct,
      prevVotes: candidate.prevVotes ?? "",
      prevVotePct: candidate.prevVotePct ?? "",
    })),
    districts: election.districts.map((district) => ({
      id: district.id,
      name: district.name,
      slug: district.slug,
      order: district.order,
      totalBoxes: district.totalBoxes,
      openBoxes: district.openBoxes,
      turnoutPct: district.turnoutPct,
    })),
  };

  return (
    <>
      <PageHeader title={election.title} description={`/${election.slug} · Seçim merkezi düzenleme`} />
      <ElectionYskPanel
        electionId={election.id}
        yskSyncEnabled={election.yskSyncEnabled}
        yskLastSyncAt={election.yskLastSyncAt?.toISOString() ?? null}
        yskLastSyncError={election.yskLastSyncError}
      />
      <ElectionForm defaults={defaults} />
    </>
  );
}
