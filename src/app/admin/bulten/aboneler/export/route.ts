import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireRole(["ADMIN"]);
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rows = [
    ["email", "name", "status", "source", "createdAt"].join(","),
    ...subscribers.map((s) =>
      [
        s.email,
        csvCell(s.name ?? ""),
        s.status,
        s.source,
        s.createdAt.toISOString(),
      ].join(","),
    ),
  ];

  return new NextResponse(`\uFEFF${rows.join("\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="bulten-aboneler.csv"',
    },
  });
}

function csvCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
