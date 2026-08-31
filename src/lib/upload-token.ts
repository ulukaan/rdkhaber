import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const TTL_MS = 10 * 60_000;

function secret() {
  const key = process.env.AUTH_SECRET?.trim();
  if (!key || key.length < 32) {
    throw new Error("AUTH_SECRET yapılandırılmamış.");
  }
  return key;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** Anonim okuyucu yüklemeleri için kısa ömürlü imzalı token. */
export function createPublicUploadToken(clientIp: string) {
  const exp = Date.now() + TTL_MS;
  const nonce = randomBytes(10).toString("hex");
  const payload = `${exp}.${nonce}.${clientIp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyPublicUploadToken(token: string, clientIp: string) {
  if (!token?.trim()) return false;
  const parts = token.trim().split(".");
  if (parts.length !== 4) return false;

  const [expRaw, nonce, ip, sig] = parts;
  if (!expRaw || !nonce || !ip || !sig) return false;

  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  if (ip !== clientIp) return false;

  const payload = `${expRaw}.${nonce}.${ip}`;
  const expected = sign(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
