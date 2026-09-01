import { describe, expect, it } from "vitest";
import {
  computeDhondtSeats,
  materializeCandidateTotals,
  roundStatusFromElectionStatus,
  snapshotKindFromElectionStatus,
} from "@/lib/election-engine";

describe("election-engine", () => {
  it("maps election status to round status", () => {
    expect(roundStatusFromElectionStatus("FINISHED")).toBe("FINAL");
    expect(roundStatusFromElectionStatus("LIVE")).toBe("PROVISIONAL");
    expect(roundStatusFromElectionStatus("UPCOMING")).toBe("SCHEDULED");
    expect(roundStatusFromElectionStatus("DRAFT")).toBe("SCHEDULED");
  });

  it("maps election status to snapshot kind", () => {
    expect(snapshotKindFromElectionStatus("FINISHED")).toBe("FINAL");
    expect(snapshotKindFromElectionStatus("LIVE")).toBe("PROVISIONAL");
    expect(snapshotKindFromElectionStatus("UPCOMING")).toBe("UPDATED");
    expect(snapshotKindFromElectionStatus("DRAFT")).toBe("UPDATED");
  });

  it("recalculates candidate percentages from valid votes", () => {
    const rows = materializeCandidateTotals(
      [
        { id: "a", votes: 600, votePct: 0 },
        { id: "b", votes: 400, votePct: 0 },
      ],
      1000,
    );
    expect(rows[0]?.votePct).toBeCloseTo(60, 1);
    expect(rows[1]?.votePct).toBeCloseTo(40, 1);
  });

  it("allocates council seats with D'Hondt", () => {
    const seats = computeDhondtSeats(
      [
        { key: "a", votes: 48000 },
        { key: "b", votes: 36000 },
        { key: "c", votes: 16000 },
      ],
      5,
    );
    const total = seats.reduce((sum, row) => sum + row.seats, 0);
    expect(total).toBe(5);
    expect(seats.find((row) => row.key === "a")?.seats).toBeGreaterThan(
      seats.find((row) => row.key === "c")?.seats ?? 0,
    );
  });
});
