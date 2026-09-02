import { cache } from "react";
import { unstable_cache } from "next/cache";
import https from "node:https";

/** ilan.gov.tr şehir kodu — Düzce */
export const DUZCE_CITY_ID = 36;

export const OFFICIAL_AD_TYPES = [
  { key: "icra", label: "İCRA", ats: 2, color: "#5BA3D9" },
  { key: "ihale", label: "İHALE", ats: 3, color: "#7A9A9C" },
  { key: "tebligat", label: "TEBLİGAT", ats: 4, color: "#E07A6A" },
  { key: "personel", label: "PERSONEL ALIMI", ats: 5, color: "#E8B04A" },
] as const;

export type OfficialAdType = (typeof OFFICIAL_AD_TYPES)[number]["key"];

const API_URL = "https://www.ilan.gov.tr/api/api/services/app/Ad/AdsByFilter";
const SITE_ORIGIN = "https://www.ilan.gov.tr";
const LIST_URL = `${SITE_ORIGIN}/ilan/tum-ilanlar?aci=${DUZCE_CITY_ID}&currentPage=1`;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export type OfficialAd = {
  id: string;
  adNo: string;
  title: string;
  advertiserName: string;
  city: string;
  county: string | null;
  adType: string | null;
  typeKey: OfficialAdType | null;
  publishedAt: string | null;
  href: string;
};

export type OfficialAdsBundle = {
  byType: Record<OfficialAdType, OfficialAd[]>;
  totals: Record<OfficialAdType, number>;
};

type ApiAd = {
  id?: string | number;
  adNo?: string;
  title?: string;
  advertiserName?: string;
  addressCityName?: string;
  addressCountyName?: string;
  publishStartDate?: string;
  urlStr?: string;
  adTypeFilters?: Array<{ key?: string; value?: string }>;
};

function pickAdTypeLabel(filters: ApiAd["adTypeFilters"]): string | null {
  const row = filters?.find((f) => {
    const key = (f.key ?? "").toLocaleLowerCase("tr-TR");
    return key.includes("ilan tür") || key.includes("ilan tur");
  });
  return row?.value?.trim() || null;
}

export function normalizeOfficialAdType(raw: string | null | undefined): OfficialAdType | null {
  const v = (raw ?? "").toLocaleUpperCase("tr-TR");
  if (v.includes("İCRA") || v.includes("ICRA")) return "icra";
  if (v.includes("İHALE") || v.includes("IHALE")) return "ihale";
  if (v.includes("TEBLİGAT") || v.includes("TEBLIGAT")) return "tebligat";
  if (v.includes("PERSONEL")) return "personel";
  return null;
}

function mapAd(raw: ApiAd, fallbackType?: OfficialAdType): OfficialAd | null {
  const id = String(raw.id ?? "").trim();
  const title = (raw.title ?? "").trim();
  const path = (raw.urlStr ?? "").trim();
  if (!id || !title || !path) return null;
  const adType = pickAdTypeLabel(raw.adTypeFilters);
  return {
    id,
    adNo: (raw.adNo ?? "").trim(),
    title,
    advertiserName: (raw.advertiserName ?? "").trim(),
    city: (raw.addressCityName ?? "Düzce").trim(),
    county: (raw.addressCountyName ?? "").trim() || null,
    adType,
    typeKey: normalizeOfficialAdType(adType) ?? fallbackType ?? null,
    publishedAt: raw.publishStartDate ?? null,
    href: path.startsWith("http")
      ? path
      : `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`,
  };
}

export function getOfficialAdsListUrl(type?: OfficialAdType) {
  if (!type) return LIST_URL;
  const ats = OFFICIAL_AD_TYPES.find((t) => t.key === type)?.ats;
  if (!ats) return LIST_URL;
  return `${SITE_ORIGIN}/ilan/tum-ilanlar?aci=${DUZCE_CITY_ID}&ats=${ats}&currentPage=1`;
}

/**
 * ilan.gov.tr ara sertifika zincirini eksik gönderiyor; Node TLS doğrulaması
 * düşüyor. Yalnızca bu sabit host için doğrulama gevşetilir.
 */
function postOfficialAdsApi(body: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json-patch+json",
          Accept: "text/plain",
          "X-Request-Origin": "IGT-UI",
          "User-Agent": UA,
          "Content-Length": Buffer.byteLength(body),
        },
        rejectUnauthorized: false,
        timeout: 15000,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          if ((res.statusCode ?? 0) >= 400) {
            reject(new Error(`ilan.gov.tr HTTP ${res.statusCode}`));
            return;
          }
          resolve(Buffer.concat(chunks).toString("utf8"));
        });
      },
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("ilan.gov.tr timeout"));
    });
    req.write(body);
    req.end();
  });
}

async function fetchAdsForType(
  type: (typeof OFFICIAL_AD_TYPES)[number],
  limit: number,
): Promise<{ items: OfficialAd[]; total: number }> {
  const maxResultCount = Math.min(Math.max(limit, 1), 24);
  try {
    const raw = await postOfficialAdsApi(
      JSON.stringify({
        keys: { aci: [DUZCE_CITY_ID], ats: [type.ats] },
        skipCount: 0,
        maxResultCount,
      }),
    );
    const json = JSON.parse(raw) as {
      success?: boolean;
      result?: { ads?: ApiAd[]; numFound?: number };
    };
    if (!json.success || !Array.isArray(json.result?.ads)) {
      return { items: [], total: 0 };
    }
    const items = json.result.ads
      .map((ad) => mapAd(ad, type.key))
      .filter((row): row is OfficialAd => Boolean(row))
      .slice(0, maxResultCount);
    return {
      items,
      total: typeof json.result.numFound === "number" ? json.result.numFound : items.length,
    };
  } catch {
    return { items: [], total: 0 };
  }
}

async function fetchOfficialAdsBundle(limitPerType: number): Promise<OfficialAdsBundle> {
  const rows = await Promise.all(
    OFFICIAL_AD_TYPES.map(async (type) => {
      const result = await fetchAdsForType(type, limitPerType);
      return { key: type.key, ...result };
    }),
  );

  const byType = {} as Record<OfficialAdType, OfficialAd[]>;
  const totals = {} as Record<OfficialAdType, number>;
  for (const row of rows) {
    byType[row.key] = row.items;
    totals[row.key] = row.total;
  }
  return { byType, totals };
}

const getOfficialAdsBundleCached = unstable_cache(
  async (limitPerType: number) => fetchOfficialAdsBundle(limitPerType),
  ["official-ads-duzce-by-type"],
  { revalidate: 1800 },
);

export const getOfficialAdsBundle = cache(async (limitPerType = 24): Promise<OfficialAdsBundle> => {
  return getOfficialAdsBundleCached(limitPerType);
});

/** @deprecated — bundle kullanın */
export const getOfficialAds = cache(async (limit = 6): Promise<OfficialAd[]> => {
  const bundle = await getOfficialAdsBundle(limit);
  return OFFICIAL_AD_TYPES.flatMap((t) => bundle.byType[t.key]).slice(0, limit);
});
