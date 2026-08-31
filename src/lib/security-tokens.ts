import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const TTL_MS = 5 * 60_000;

function secret() {
  const key = process.env.AUTH_SECRET?.trim();
  if (!key || key.length < 32) throw new Error("AUTH_SECRET missing");
  return key;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** 2FA adımı için kısa ömürlü giriş challenge token. */
export function createLoginChallenge(userId: string) {
  const exp = Date.now() + TTL_MS;
  const nonce = randomBytes(8).toString("hex");
  const payload = `${exp}.${nonce}.${userId}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyLoginChallenge(token: string, userId: string) {
  const parts = token.trim().split(".");
  if (parts.length !== 4) return false;
  const [expRaw, , uid, sig] = parts;
  if (!expRaw || !uid || !sig || uid !== userId) return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const payload = `${expRaw}.${parts[1]}.${uid}`;
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(sign(payload));
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function verifyCronSecret(header: string | null) {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) return false;
  if (!header?.trim()) return false;
  try {
    const a = Buffer.from(header.trim());
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return header.trim() === expected;
  }
}
