import { describe, expect, it } from "vitest";
import {
  BREAKING_TTL_HOURS,
  activeBreakingWhere,
  breakingExpiresAt,
  isActiveBreaking,
} from "@/lib/breaking-news";

describe("breaking-news", () => {
  const now = new Date("2026-09-01T12:00:00.000Z");
  const publishedAt = new Date("2026-09-01T10:00:00.000Z");

  it("marks fresh breaking articles as active", () => {
    expect(
      isActiveBreaking({ isBreaking: true, publishedAt }, now),
    ).toBe(true);
  });

  it("expires breaking articles after TTL", () => {
    const oldPublishedAt = new Date(now.getTime() - BREAKING_TTL_HOURS * 60 * 60 * 1000 - 1);
    expect(
      isActiveBreaking({ isBreaking: true, publishedAt: oldPublishedAt }, now),
    ).toBe(false);
  });

  it("ignores non-breaking articles", () => {
    expect(
      isActiveBreaking({ isBreaking: false, publishedAt }, now),
    ).toBe(false);
  });

  it("builds prisma filter from TTL window", () => {
    const where = activeBreakingWhere(now);
    expect(where.isBreaking).toBe(true);
    expect(where.publishedAt.gte.getTime()).toBe(
      now.getTime() - BREAKING_TTL_HOURS * 60 * 60 * 1000,
    );
  });

  it("computes expiry from publish time", () => {
    expect(breakingExpiresAt(publishedAt, now)?.toISOString()).toBe(
      new Date(publishedAt.getTime() + BREAKING_TTL_HOURS * 60 * 60 * 1000).toISOString(),
    );
  });
});
