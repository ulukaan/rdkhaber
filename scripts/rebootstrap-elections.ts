/**
 * Mevcut seçimler için motoru yeniden çalıştırır (ittifak, person, snapshot).
 * npx tsx scripts/rebootstrap-elections.ts
 */
import { PrismaClient } from "@prisma/client";
import { bootstrapElectionEngine } from "../src/lib/election-engine";
import { syncElectionCandidateParties } from "../src/lib/election-party";

const prisma = new PrismaClient();

async function main() {
  const elections = await prisma.election.findMany({
    select: { id: true, slug: true, status: true, electionDate: true, yskIlId: true },
  });

  for (const election of elections) {
    await prisma.$transaction(
      async (tx) => {
        await syncElectionCandidateParties(tx, election.id);
        await bootstrapElectionEngine(tx, election.id, {
          electionDate: election.electionDate,
          status: election.status,
          provincePlateId: election.yskIlId ?? 81,
          snapshot: { label: "Motor yeniden senkron", activate: true },
        });
      },
      { timeout: 120_000 },
    );
    console.log("rebootstrapped:", election.slug);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
