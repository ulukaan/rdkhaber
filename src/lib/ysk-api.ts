import { safeFetch } from "@/lib/safe-fetch";

/** YSK açık veri portalı — https://acikveri.ysk.gov.tr/api/ */
export const YSK_API_BASE = process.env.YSK_API_BASE?.trim() || "https://acikveri.ysk.gov.tr/api";

export const YSK_SECIM = {
  YEREL_2024: 20260,
  YEREL_2019: 16400,
} as const;

/** Portal enum (JQ) — belediye başkanlığı = 2 */
export const YSK_SECIM_TURU = {
  BELEDIYE_BASKANLIGI: 2,
  BELEDIYE_MECLISI: 3,
  IL_GENEL_MECLISI: 4,
  BUYUKSEHIR: 6,
  CUMHURBASKANLIGI: 9,
  MILLETVEKILI: 8,
} as const;

export const DUZCE_IL_ID = 81;

const DEFAULT_TIMEOUT_MS = 15_000;

export type YskSecimListItem = {
  secim_ID: number | null;
  secim_ADI: string | null;
  secim_TARIHI: string | null;
};

export type YskResultHeader = {
  sira_NO: number;
  ad: string;
  column_NAME: string;
};

export type YskDistrictBoxStats = {
  ilce_ID: number;
  ilce_KODU: number;
  ilce_ADI: string;
  toplam_SANDIK_SAYISI: number;
  sandik_SAYISI: number;
  secmen_SAYISI: number;
};

export type YskDistrictCandidate = {
  il_KODU: number;
  il_ADI: string;
  ilce_KODU: number;
  ilce_ADI: string;
  belde_ADI: string | null;
  adi_SOYADI: string;
  parti_KISA_ADI: string;
  parti_ADI: string;
};

export type YskSandikResultRow = Record<string, string | number | null | undefined> & {
  il_ADI?: string | null;
  ilce_ADI?: string | null;
  belde_ADI?: string | null;
  gecerli_OY_TOPLAMI?: number | null;
  oy_KULLANAN_SECMEN_SAYISI?: number | null;
  secmen_SAYISI?: number | null;
};

export type YskElectionConfig = {
  secimId: number;
  secimTuru: number;
  ilId: number;
  focusIlce: string;
};

type YskQuery = Record<string, string | number | undefined | null>;

function buildUrl(path: string, query: YskQuery = {}) {
  const url = new URL(`${YSK_API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`);
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function yskGet<T>(path: string, query: YskQuery = {}): Promise<T> {
  const res = await safeFetch(buildUrl(path, query), {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`YSK API ${path} HTTP ${res.status}${body ? `: ${body.slice(0, 180)}` : ""}`);
  }
  return (await res.json()) as T;
}

/** Portalın kullandığı boş parametre seti — yurtIciDisi=1 il/ilçe kırılımı için zorunlu. */
const EMPTY_RESULT_QUERY: YskQuery = {
  ilceId: "",
  beldeId: "",
  birimId: "",
  muhtarlikId: "",
  cezaeviId: "",
  sandikTuru: "",
  sandikNoIlk: "",
  sandikNoSon: "",
  ulkeId: "",
  disTemsilcilikId: "",
  gumrukId: "",
  yurtIciDisi: 1,
  sandikRumuzIlk: "",
  sandikRumuzSon: "",
  secimCevresiId: "",
  sandikId: "",
  sorguTuru: "",
};

export function resolveYskConfig(overrides: Partial<YskElectionConfig> = {}): YskElectionConfig {
  const secimId = overrides.secimId ?? (Number(process.env.YSK_SECIM_ID) || YSK_SECIM.YEREL_2024);
  const secimTuru =
    overrides.secimTuru ?? (Number(process.env.YSK_SECIM_TURU) || YSK_SECIM_TURU.BELEDIYE_BASKANLIGI);
  const ilId = overrides.ilId ?? (Number(process.env.YSK_IL_ID) || DUZCE_IL_ID);
  const focusIlce = overrides.focusIlce?.trim() || process.env.YSK_FOCUS_ILCE?.trim() || "DÜZCE MERKEZ";
  return { secimId, secimTuru, ilId, focusIlce };
}

export async function fetchYskSecimList() {
  return yskGet<YskSecimListItem[]>("getSecimList", {
    secimSayi: 11,
    araSecim: 0,
    yenilemeSecimi: 0,
  });
}

export async function fetchYskResultHeaders(config: YskElectionConfig) {
  return yskGet<YskResultHeader[]>("getSandikSecimSonucBaslikList", {
    secimId: config.secimId,
    secimCevresiId: "",
    ilId: config.ilId,
    bagimsiz: 1,
    secimTuru: config.secimTuru,
    yurtIciDisi: 1,
  });
}

export async function fetchYskDistrictBoxStats(config: YskElectionConfig) {
  return yskGet<YskDistrictBoxStats[]>("getSecmenSandikSayisiYurticiIlGroupIlce", {
    secimId: config.secimId,
    secimTuru: config.secimTuru,
    ilId: config.ilId,
  });
}

export async function fetchYskDistrictCandidates(config: YskElectionConfig) {
  return yskGet<YskDistrictCandidate[]>("getIlceBelediyeBaskanligiAdayListesi", {
    secimId: config.secimId,
    ilId: config.ilId,
  });
}

/** İlçe birleştirme tutanağı toplamları (sorguTuru=2). */
export async function fetchYskDistrictResults(config: YskElectionConfig) {
  return yskGet<YskSandikResultRow[]>("getSecimSandikSonucList", {
    secimId: config.secimId,
    secimTuru: config.secimTuru,
    ilId: config.ilId,
    ...EMPTY_RESULT_QUERY,
    sorguTuru: 2,
  });
}

/** Odak ilçe (ör. Düzce Merkez) parti oy dağılımı. */
export async function fetchYskFocusDistrictResult(config: YskElectionConfig) {
  const rows = await fetchYskDistrictResults(config);
  const focus = normalizeYskPlace(config.focusIlce);
  const match = rows.find((row) => normalizeYskPlace(row.ilce_ADI) === focus && !row.belde_ADI);
  if (!match) {
    throw new Error(`YSK odak ilçe sonucu bulunamadı: ${config.focusIlce}`);
  }
  return match;
}

export function normalizeYskPlace(value: string | null | undefined) {
  return (value ?? "")
    .trim()
    .toLocaleUpperCase("tr-TR")
    .replace(/\s+/g, " ");
}

export function normalizeYskParty(value: string | null | undefined) {
  return normalizeYskPlace(value)
    .replace(/PARTİSİ$/i, "")
    .replace(/PARTİ$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function readYskVoteColumn(row: YskSandikResultRow, columnName: string) {
  const raw = row[columnName];
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") return Number(raw) || 0;
  return 0;
}
