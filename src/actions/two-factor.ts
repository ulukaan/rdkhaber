"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import {
  generateTotpSecret,
  getTotpUri,
  openTotpSecret,
  sealTotpSecret,
  verifyTotpCode,
} from "@/lib/totp";
import { getSettings } from "@/lib/settings";
import { writeAuditLog } from "@/lib/audit-log";

export async function startTotpSetupAction() {
  const session = await requireRole(["ADMIN"]);
  const secret = generateTotpSecret();
  const settings = await getSettings();
  const uri = getTotpUri(secret, session.user.email ?? "admin", settings.siteName);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { totpSecret: sealTotpSecret(secret), totpEnabled: false },
  });

  return { secret, uri };
}

export async function enableTotpAction(code: string) {
  const session = await requireRole(["ADMIN"]);
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpSecret: true },
  });
  const secret = openTotpSecret(user?.totpSecret);
  if (!secret || !verifyTotpCode(secret, code)) {
    return { error: "Kod doğrulanamadı." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { totpEnabled: true },
  });
  await writeAuditLog({ userId: session.user.id, action: "security.2fa.enabled" });
  revalidatePath("/admin/guvenlik");
  return { success: true as const };
}

export async function disableTotpAction(code: string) {
  const session = await requireRole(["ADMIN"]);
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpSecret: true },
  });
  const secret = openTotpSecret(user?.totpSecret);
  if (!secret || !verifyTotpCode(secret, code)) {
    return { error: "Kod doğrulanamadı." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { totpEnabled: false, totpSecret: null },
  });
  await writeAuditLog({ userId: session.user.id, action: "security.2fa.disabled" });
  revalidatePath("/admin/guvenlik");
  return { success: true as const };
}

export async function getTotpStatusAction() {
  const session = await requireRole(["ADMIN"]);
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpEnabled: true },
  });
  return { enabled: Boolean(user?.totpEnabled) };
}
