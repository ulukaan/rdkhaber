import { NextRequest, NextResponse } from "next/server";
import { publishScheduledArticles } from "@/lib/article-publish-hooks";
import { verifyCronSecret } from "@/lib/security-tokens";
import { writeAuditLog } from "@/lib/audit-log";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const secretHeader = request.headers.get("x-cron-secret");
  if (!verifyCronSecret(bearer) && !verifyCronSecret(secretHeader)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const result = await publishScheduledArticles();
    await writeAuditLog({ action: "cron.publish_scheduled", meta: result });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "cron_failed" },
      { status: 500 },
    );
  }
}
