import { NextRequest, NextResponse } from "next/server";
import { readdir, stat, unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { verifyCronSecret } from "@/lib/security-tokens";
import { getUploadRoot } from "@/lib/upload-path";

const MAX_AGE_MS = 7 * 24 * 60 * 60_000;

async function collectFiles(dir: string): Promise<string[]> {
  let entries: string[] = [];
  try {
    entries = await readdir(dir);
  } catch {
    return [];
  }
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const info = await stat(full);
    if (info.isDirectory()) {
      files.push(...(await collectFiles(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const secretHeader = request.headers.get("x-cron-secret");
  if (!verifyCronSecret(bearer) && !verifyCronSecret(secretHeader)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const root = await getUploadRoot();
  const readerDirs = [
    path.join(root, "reader"),
    path.join(process.cwd(), "public", "uploads", "reader"),
  ];
  const files = [
    ...new Set(
      (await Promise.all(readerDirs.map((dir) => collectFiles(dir)))).flat(),
    ),
  ];
  const now = Date.now();
  let deleted = 0;

  for (const file of files) {
    const info = await stat(file);
    if (now - info.mtimeMs < MAX_AGE_MS) continue;
    const fromPersistent = path.relative(root, file).replace(/\\/g, "/");
    const fromPublic = path
      .relative(path.join(process.cwd(), "public"), file)
      .replace(/\\/g, "/");
    const rel = fromPersistent.startsWith("..")
      ? `/${fromPublic}`
      : `/uploads/${fromPersistent}`;
    const usedInTips = await prisma.tip.count({
      where: { attachmentUrl: { contains: rel } },
    });
    const usedInSubs = await prisma.newsSubmission.count({
      where: { attachmentUrl: { contains: rel } },
    });
    if (usedInTips + usedInSubs > 0) continue;
    await unlink(file);
    deleted += 1;
  }

  return NextResponse.json({ ok: true, scanned: files.length, deleted });
}
