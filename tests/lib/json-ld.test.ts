import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { buildNewsArticleJsonLd } from "@/lib/json-ld";

describe("buildNewsArticleJsonLd", () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env = { ...env };
    process.env.NEXT_PUBLIC_SITE_URL = "https://duzceradikal.com";
  });

  afterEach(() => {
    process.env = { ...env };
  });

  it("includes publisher logo and falls back datePublished", () => {
    const updatedAt = new Date("2026-09-12T10:00:00.000Z");
    const ld = buildNewsArticleJsonLd({
      title: "Test Haber",
      summary: "Özet",
      slug: "test-haber",
      publishedAt: null,
      updatedAt,
      authorName: "Editör",
      siteName: "Düzce Radikal",
      logoUrl: "/brand/logo.png",
      section: "Spor",
      coverImageUrl: "/uploads/cover.jpg",
      keywords: ["Düzcespor", "Spor"],
    });

    expect(ld["@type"]).toBe("NewsArticle");
    expect(ld.datePublished).toBe(updatedAt.toISOString());
    expect(ld.publisher).toMatchObject({
      "@type": "NewsMediaOrganization",
      name: "Düzce Radikal",
    });
    expect(ld.publisher.logo.url).toBe("https://duzceradikal.com/brand/logo.png");
    expect(ld.image).toEqual(["https://duzceradikal.com/uploads/cover.jpg"]);
    expect(ld.articleSection).toBe("Spor");
  });
});
