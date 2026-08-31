import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { clientIp } from "@/lib/rate-limit";

export async function writeAuditLog(input: {
  userId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  meta?: Record<string, unknown>;
}) {
  try {
    const h = await headers();
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action.slice(0, 120),
        entity: input.entity?.slice(0, 80),
        entityId: input.entityId?.slice(0, 191),
        meta: input.meta ? JSON.stringify(input.meta).slice(0, 4000) : null,
        ip: clientIp(h),
      },
    });
  } catch {
    // Audit hatası ana işlemi durdurmaz.
  }
}
