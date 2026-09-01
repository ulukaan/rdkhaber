import { Container } from "@/components/ui/Container";
import { ElectionHubClient, type ElectionHubPayload } from "@/components/election/ElectionHubClient";
import {
  computeBoxPct,
  computeVotePct,
  getElectionNewsArticles,
  getPrimaryElection,
} from "@/lib/election";
import type { ElectionDistrictView } from "@/components/election/ElectionDistrictGrid";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Seçim Sonuçları" };
export const revalidate = 30;

function buildDistrictViews(
  election: NonNullable<Awaited<ReturnType<typeof getPrimaryElection>>>,
): ElectionDistrictView[] {
  return election.districts.map((district) => {
    const mayorResults = district.results
      .filter((result) => result.candidate.raceType === "MAYOR")
      .sort((a, b) => b.votes - a.votes);
    const leader = mayorResults[0];
    return {
      id: district.id,
      name: district.name,
      slug: district.slug,
      totalBoxes: district.totalBoxes,
      openBoxes: district.openBoxes,
      turnoutPct: district.turnoutPct,
      leadingName: leader?.candidate.name,
      leadingParty: leader?.candidate.partyName,
      leadingPct: leader?.votePct,
    };
  });
}

export default async function SecimPage() {
  const election = await getPrimaryElection();

  if (!election) {
    return (
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-xl rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-ink">Seçim Merkezi</h1>
          <p className="mt-3 text-sm text-ink-soft">
            Şu an yayında bir seçim ekranı yok. Yönetim panelinden seçim oluşturup birincil olarak işaretleyin.
          </p>
        </div>
      </Container>
    );
  }

  const news = await getElectionNewsArticles(election.categorySlug);
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
    candidates: election.candidates.map((candidate) => ({
      id: candidate.id,
      raceType: candidate.raceType,
      name: candidate.name,
      partyName: candidate.partyName,
      partyColor: candidate.partyColor,
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
  };

  return (
    <Container className="py-5 sm:py-8">
      <ElectionHubClient election={payload} />
      <div className="mt-8 text-center">
        <Button href="/" variant="outline">
          Ana sayfaya dön
        </Button>
      </div>
    </Container>
  );
}
