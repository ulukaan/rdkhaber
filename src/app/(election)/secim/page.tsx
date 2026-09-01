import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ElectionHubClient, type ElectionHubPayload } from "@/components/election/ElectionHubClient";
import { ElectionPageHeader } from "@/components/election/ElectionPageHeader";
import { ElectionPageShell } from "@/components/election/ElectionPageShell";
import {
  computeVotePct,
  getElectionNewsArticles,
  getSecimPageElection,
} from "@/lib/election";
import { getActiveCouncilSeats, getActiveSnapshotMeta } from "@/lib/election-engine";
import { DUZCE_2024_DISTRICT_LEADERS } from "@/lib/election-duzce-data";
import { resolveNtvDistrictId, resolvePartyColor } from "@/lib/election-candidate-photo";
import { getSettings } from "@/lib/settings";
import type { ElectionDistrictView } from "@/components/election/ElectionDistrictGrid";

export const metadata = { title: "Seçim Sonuçları" };
export const revalidate = 30;

type SecimElection = NonNullable<Awaited<ReturnType<typeof getSecimPageElection>>>["election"];

function buildDistrictViews(election: SecimElection): ElectionDistrictView[] {
  return election.districts.map((district) => {
    const mayorResults = district.results
      .filter((result) => result.candidate.raceType === "MAYOR")
      .sort((a, b) => b.votes - a.votes);
    const leader = mayorResults[0];
    const fallback = DUZCE_2024_DISTRICT_LEADERS[district.slug];
    return {
      id: district.id,
      name: district.name,
      slug: district.slug,
      totalBoxes: district.totalBoxes,
      openBoxes: district.openBoxes,
      turnoutPct: district.turnoutPct,
      leadingName: leader?.candidate.name ?? fallback?.leadingName,
      leadingParty: leader?.candidate.partyName ?? fallback?.leadingParty,
      leadingPartyColor: resolvePartyColor(
        leader?.candidate.partyName ?? fallback?.leadingParty ?? "",
        leader?.candidate.partyColor ?? fallback?.leadingPartyColor,
      ),
      leadingVotes: leader?.votes ?? fallback?.leadingVotes,
      leadingPct: leader?.votePct ?? fallback?.leadingPct,
    };
  });
}

export default async function SecimPage() {
  const [secimData, settings] = await Promise.all([getSecimPageElection(), getSettings()]);

  if (!secimData) {
    return (
      <>
        <ElectionPageHeader
          siteName={settings.siteName}
          logoUrl={settings.logoUrl}
          title="Seçim Merkezi"
          subtitle="Düzce seçim sonuçları ve haberleri"
          status="UPCOMING"
          liveRefreshSec={30}
        />
        <Container className="py-10 sm:py-14">
          <div className="mx-auto max-w-xl border border-border bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-ink-soft">
              Henüz yayınlanmış seçim sonucu bulunmuyor. Seçim döneminde bu sayfa canlı sonuçlarla güncellenecek.
            </p>
            <Link
              href="/kategori/secim"
              className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
            >
              Seçim haberlerine git →
            </Link>
          </div>
        </Container>
      </>
    );
  }

  const { election, mode } = secimData;
  const news = await getElectionNewsArticles(election.categorySlug);
  const [snapshotMeta, councilSeats] = await Promise.all([
    getActiveSnapshotMeta(election.id),
    getActiveCouncilSeats(election.id),
  ]);
  const payload: ElectionHubPayload = {
    slug: election.slug,
    title: election.title,
    subtitle: election.subtitle,
    status: election.status,
    liveRefreshSec: election.liveRefreshSec,
    lastResultsAt: election.lastResultsAt?.toISOString() ?? null,
    totalBoxes: election.totalBoxes,
    openBoxes: election.openBoxes,
    totalVoters: election.totalVoters,
    usedVotes: election.usedVotes,
    validVotes: election.validVotes,
    ntvCityId: election.yskIlId ?? 81,
    ntvDistrictId: resolveNtvDistrictId(election.yskIlId ?? 81),
    candidates: election.candidates.map((candidate) => ({
      id: candidate.id,
      raceType: candidate.raceType,
      name: candidate.name,
      partyName: candidate.partyName,
      partyColor: resolvePartyColor(candidate.partyName, candidate.partyColor),
      photoUrl: candidate.photoUrl,
      slogan: candidate.slogan,
      votes: candidate.votes,
      votePct:
        election.validVotes > 0
          ? computeVotePct(candidate.votes, election.validVotes)
          : candidate.votePct,
      prevVotes: candidate.prevVotes,
      prevVotePct: candidate.prevVotePct,
    })),
    districts: buildDistrictViews(election),
    news: news.map((article) => ({
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      coverImageUrl: article.coverImageUrl,
      publishedAt: article.publishedAt?.toISOString() ?? null,
    })),
    councilSeats,
  };

  return (
    <ElectionPageShell
      siteName={settings.siteName}
      logoUrl={settings.logoUrl}
      title={election.title}
      subtitle={election.subtitle}
      status={election.status}
      liveRefreshSec={election.liveRefreshSec}
      lastResultsAt={election.lastResultsAt?.toISOString() ?? null}
      election={payload}
      pageMode={mode}
      archiveTitle={election.title}
      archiveDate={election.electionDate?.toISOString() ?? null}
      snapshotMeta={
        snapshotMeta
          ? {
              kind: snapshotMeta.kind,
              sourceName: snapshotMeta.sourceName,
              sourceUrl: snapshotMeta.sourceUrl,
              importedAt: snapshotMeta.importedAt.toISOString(),
              verified: snapshotMeta.verified,
            }
          : null
      }
    />
  );
}
