import { NextRequest, NextResponse } from "next/server";
import { runAllHaberBotSources } from "@/lib/haber-bot/import";
import { verifyCronSecret } from "@/lib/security-tokens";
import { writeAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const secretHeader = request.headers.get("x-cron-secret");
  if (!verifyCronSecret(bearer) && !verifyCronSecret(secretHeader)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN", active: true },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });
    if (!admin) {
      return NextResponse.json({ ok: false, error: "Admin kullanıcı bulunamadı" }, { status: 500 });
    }
    const result = await runAllHaberBotSources(admin.id);
    await writeAuditLog({
      action: "cron.haber_bot",
      meta: result as unknown as Record<string, unknown>,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "cron_failed" },
      { status: 500 },
    );
  }
}
