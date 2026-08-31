import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const PREFIX = "enc:v1:";

function deriveKey() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET en az 32 karakter olmalı (gizli alan şifrelemesi için).");
  }
  return createHash("sha256").update(`rdk-secrets:${secret}`).digest();
}

/** Veritabanında saklanan SMTP/IMAP şifreleri için AES-256-GCM. */
export function encryptSecret(plain: string) {
  const text = plain.trim();
  if (!text) return "";
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64url")}.${encrypted.toString("base64url")}.${tag.toString("base64url")}`;
}

export function decryptSecret(stored: string) {
  const value = stored.trim();
  if (!value) return "";
  if (!value.startsWith(PREFIX)) return value;

  const payload = value.slice(PREFIX.length);
  const [ivB64, dataB64, tagB64] = payload.split(".");
  if (!ivB64 || !dataB64 || !tagB64) return "";

  try {
    const iv = Buffer.from(ivB64, "base64url");
    const data = Buffer.from(dataB64, "base64url");
    const tag = Buffer.from(tagB64, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", deriveKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}
