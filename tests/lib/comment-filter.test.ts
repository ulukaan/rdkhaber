import { describe, expect, it } from "vitest";
import { filterCommentContent } from "@/lib/comment-filter";

describe("filterCommentContent", () => {
  it("normal yorumu kabul eder", () => {
    expect(filterCommentContent("Teşekkürler, güzel haber.")).toEqual({ ok: true });
  });

  it("spam linkleri reddeder", () => {
    const result = filterCommentContent("http://a.com http://b.com http://c.com");
    expect(result.ok).toBe(false);
  });

  it("yasaklı kelimeyi reddeder", () => {
    const result = filterCommentContent("casino bonus");
    expect(result.ok).toBe(false);
  });
});
