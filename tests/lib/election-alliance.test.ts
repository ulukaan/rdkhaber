import { describe, expect, it } from "vitest";
import { mergeVotesByAlliance } from "@/lib/election-alliance";

describe("election-alliance", () => {
  it("merges party votes into alliance buckets", () => {
    const partyToAlliance = new Map([
      ["p1", { allianceId: "a1", displayName: "Cumhur İttifakı" }],
      ["p2", { allianceId: "a1", displayName: "Cumhur İttifakı" }],
    ]);

    const buckets = mergeVotesByAlliance(
      [
        { partyId: "p1", partyName: "AK Parti", votes: 40_000 },
        { partyId: "p2", partyName: "MHP", votes: 12_000 },
        { partyId: "p3", partyName: "CHP", votes: 35_000 },
      ],
      partyToAlliance,
    );

    expect(buckets).toHaveLength(2);
    const cumhur = buckets.find((b) => b.allianceId === "a1");
    expect(cumhur?.votes).toBe(52_000);
    expect(cumhur?.label).toBe("Cumhur İttifakı");
  });
});
