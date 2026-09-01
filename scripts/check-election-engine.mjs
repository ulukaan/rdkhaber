import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const election = await prisma.election.findFirst({ where: { isPrimary: true } });
  if (!election) {
    console.log("no primary election");
    process.exit(0);
  }

  const snapshot = await prisma.resultSnapshot.findFirst({
    where: { electionId: election.id, isActive: true },
    include: {
      seatAllocations: { include: { party: true, alliance: true } },
      import: { include: { source: true } },
    },
  });

  const persons = await prisma.person.count();
  const alliances = await prisma.electionAlliance.count();

  console.log(
    JSON.stringify(
      {
        election: election.slug,
        snapshot: snapshot
          ? {
              kind: snapshot.kind,
              verified: snapshot.import?.verified,
              source: snapshot.import?.source.name,
              seats: snapshot.seatAllocations.map((s) => ({
                label: s.alliance?.displayName ?? s.party?.name,
                seats: s.seats,
              })),
            }
          : null,
        persons,
        alliances,
      },
      null,
      2,
    ),
  );
} finally {
  await prisma.$disconnect();
}
