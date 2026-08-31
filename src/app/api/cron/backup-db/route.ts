import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { verifyCronSecret } from "@/lib/security-tokens";
import { writeAuditLog } from "@/lib/audit-log";

const execFileAsync = promisify(execFile);

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const secretHeader = request.headers.get("x-cron-secret");
  if (!verifyCronSecret(bearer) && !verifyCronSecret(secretHeader)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL yok" }, { status: 500 });
  }

  try {
    const script = path.join(process.cwd(), "scripts", "backup-db.sh");
    const { stdout } = await execFileAsync("bash", [script], {
      env: { ...process.env, BACKUP_DIR: process.env.BACKUP_DIR ?? "/tmp/rdkhaber-backups" },
      timeout: 120_000,
    });
    await writeAuditLog({ action: "cron.backup_db", meta: { stdout: stdout.slice(0, 500) } });
    return NextResponse.json({ ok: true, message: stdout.trim() });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "backup_failed" },
      { status: 500 },
    );
  }
}
