import { lookup } from "dns/promises";
import { isIP } from "net";

/** Haber botu / harici fetch için SSRF koruması. */

const BLOCKED_HOSTS = new Set(["localhost", "metadata.google.internal", "metadata"]);

function isPrivateIp(ip: string) {
  if (ip === "::1" || ip === "0.0.0.0") return true;
  if (ip.startsWith("127.") || ip.startsWith("10.") || ip.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true;
  if (ip.startsWith("169.254.") || ip.startsWith("100.64.")) return true;
  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) return true;
  return false;
}

export async function assertSafePublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    const withProto = /^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`;
    url = new URL(withProto);
  } catch {
    throw new Error("Geçerli bir adres girin");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Yalnızca http/https adresleri kabul edilir");
  }

  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("Bu adres güvenlik nedeniyle engellendi");
  }

  if (isIP(host)) {
    if (isPrivateIp(host)) throw new Error("Özel ağ adresleri engellendi");
    return url;
  }

  try {
    const results = await lookup(host, { all: true, verbatim: true });
    if (results.length === 0) throw new Error("Adres çözülemedi");
    for (const row of results) {
      if (isPrivateIp(row.address)) {
        throw new Error("Özel ağ adresleri engellendi");
      }
    }
  } catch (err) {
    if (err instanceof Error && /engellendi|çözülemedi/.test(err.message)) throw err;
    throw new Error("Adres çözülemedi");
  }

  return url;
}
