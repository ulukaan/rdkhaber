import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      db: "up",
      latencyMs: Date.now() - started,
      env: process.env.NODE_ENV ?? "unknown",
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        db: "down",
        error: err instanceof Error ? err.message : "db_error",
      },
      { status: 503 },
    );
  }
}
