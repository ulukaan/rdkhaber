import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

function authorized(req: Request) {
  const secret = process.env.HEALTH_CHECK_SECRET?.trim();
  if (!secret) return true;
  const auth = req.headers.get("authorization")?.trim();
  if (!auth?.startsWith("Bearer ")) return false;
  const token = auth.slice(7);
  if (token.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(secret));
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const body: Record<string, unknown> = {
      ok: true,
      db: "up",
      latencyMs: Date.now() - started,
    };
    if (process.env.NODE_ENV !== "production") {
      body.env = process.env.NODE_ENV;
    }
    return NextResponse.json(body);
  } catch {
    return NextResponse.json({ ok: false, db: "down" }, { status: 503 });
  }
}
