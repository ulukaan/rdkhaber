import type { ElectionRaceType } from "@prisma/client";

export const NTV_CANDIDATE_PHOTO_BASE =
  "https://secim2024-storage.ntv.com.tr/secimsonuc2024/live/assets/img/candidate";

export const NTV_PARTY_LOGO_BASE =
  "https://secim2024-storage.ntv.com.tr/secimsonuc2024/live/assets/img/party";

export const NTV_CANDIDATE_PHOTO_VERSION = "1.0.9";

/** NTV varsayılan aday silüeti — fotoğraf yoksa veya CDN 404 ise. */
export const NTV_CANDIDATE_PLACEHOLDER_URL = `${NTV_CANDIDATE_PHOTO_BASE}/aday.svg?v=${NTV_CANDIDATE_PHOTO_VERSION}`;

/** NTV ilçe kodları — Düzce Belediyesi fotoğrafları c_190 kullanır. */
export const NTV_CITY_DISTRICT_IDS: Record<number, number> = {
  81: 190,
};

/** NTV 2024 yerel seçim parti kodları (secim.ntv.com.tr veri seti). */
export const NTV_PARTY_IDS: Record<string, number> = {
  "AK PARTI": 1,
  "AK PARTİ": 1,
  "İYİ PARTI": 2,
  "İYİ PARTİ": 2,
  "IYI PARTI": 2,
  ANAP: 6,
  DSP: 7,
  "YENIDEN REFAH": 8,
  "YENİDEN REFAH": 8,
  "DEM PARTI": 9,
  "DEM PARTİ": 9,
  "ZAFER PARTISI": 12,
  "ZAFER PARTİSİ": 12,
  CHP: 18,
  MHP: 30,
};

/** NTV secim.ntv.com.tr 2024 yerel seçim — resmi parti renkleri (main.js colors). */
export const NTV_PARTY_COLORS: Record<number, string> = {
  1: "#ff7200", // AK Parti
  2: "#0f94ca", // İYİ Parti
  8: "#007d60", // Yeniden Refah
  9: "#9a007e", // DEM Parti
  18: "#a90000", // CHP
  30: "#ee1d23", // MHP
};

/** NTV haritasında tanımsız partiler için nötr renk. */
export const NTV_DEFAULT_PARTY_COLOR = "#b9c5d1";

export function resolvePartyColor(partyName: string, fallback = NTV_DEFAULT_PARTY_COLOR) {
  const partyId = resolveNtvPartyId(partyName);
  if (partyId != null && NTV_PARTY_COLORS[partyId]) return NTV_PARTY_COLORS[partyId]!;
  return fallback;
}

export function normalizePartyKey(partyName: string) {
  return (partyName ?? "")
    .trim()
    .toLocaleUpperCase("tr-TR")
    .replace(/İ/g, "I")
    .replace(/Ş/g, "S")
    .replace(/Ğ/g, "G")
    .replace(/Ü/g, "U")
    .replace(/Ö/g, "O")
    .replace(/Ç/g, "C")
    .replace(/\s+/g, " ");
}

export function resolveNtvPartyId(partyName: string) {
  const key = normalizePartyKey(partyName);
  if (NTV_PARTY_IDS[key] != null) return NTV_PARTY_IDS[key]!;
  for (const [label, id] of Object.entries(NTV_PARTY_IDS)) {
    if (key.includes(label) || label.includes(key)) return id;
  }
  return null;
}

export function resolveNtvDistrictId(cityId: number, override?: number | null) {
  if (override != null) return override;
  return NTV_CITY_DISTRICT_IDS[cityId] ?? 0;
}

/**
 * NTV CDN aday fotoğrafı.
 * ec_{il}_c_{ilceKodu}_t_{0|1}_p_{partiId}.png
 * Büyükşehirlerde c_0; Düzce belediyesi için c_190 (Merkez ilçe kodu).
 */
export function buildNtvCandidatePhotoUrl(input: {
  cityId: number;
  partyId: number;
  districtId?: number | null;
  raceType?: ElectionRaceType;
}) {
  const districtId = resolveNtvDistrictId(input.cityId, input.districtId);
  const raceIndex = input.raceType === "COUNCIL" ? 1 : 0;
  return `${NTV_CANDIDATE_PHOTO_BASE}/ec_${input.cityId}_c_${districtId}_t_${raceIndex}_p_${input.partyId}.png?v=${NTV_CANDIDATE_PHOTO_VERSION}`;
}

/** NTV parti logosu — party/{partiId}.svg */
export function buildNtvPartyLogoUrl(partyId: number) {
  return `${NTV_PARTY_LOGO_BASE}/${partyId}.svg?v=${NTV_CANDIDATE_PHOTO_VERSION}`;
}

export function resolveNtvPartyLogoUrl(partyName: string) {
  const partyId = resolveNtvPartyId(partyName);
  return partyId ? buildNtvPartyLogoUrl(partyId) : null;
}

/** Parti rengine göre otomatik avatar (ui-avatars). */
export function buildCandidateAvatarUrl(name: string, partyColor = "#d0021b") {
  const bg = partyColor.replace("#", "");
  const encoded = encodeURIComponent(name.trim() || "Aday");
  return `https://ui-avatars.com/api/?name=${encoded}&background=${bg}&color=fff&size=256&bold=true&format=png`;
}

export type CandidatePhotoSourceInput = {
  name: string;
  partyName: string;
  partyColor: string;
  photoUrl?: string | null;
  ntvCityId?: number | null;
  ntvDistrictId?: number | null;
  ntvPartyId?: number | null;
  raceType?: ElectionRaceType;
};

/** Birincil ve yedek fotoğraf URL'leri (NTV 404 olursa aday.svg'ye düşülür). */
export function resolveCandidatePhotoSources(input: CandidatePhotoSourceInput) {
  const placeholder = NTV_CANDIDATE_PLACEHOLDER_URL;
  const stored = input.photoUrl?.trim();
  if (stored && !stored.includes("ui-avatars.com") && !stored.endsWith("/aday.svg")) {
    return { src: stored, fallback: placeholder };
  }

  const partyId = input.ntvPartyId ?? resolveNtvPartyId(input.partyName);
  if (input.ntvCityId && partyId) {
    return {
      src: buildNtvCandidatePhotoUrl({
        cityId: input.ntvCityId,
        partyId,
        districtId: input.ntvDistrictId,
        raceType: input.raceType,
      }),
      fallback: placeholder,
    };
  }

  return { src: placeholder, fallback: placeholder };
}

export function resolveCandidatePhotoUrl(input: CandidatePhotoSourceInput) {
  return resolveCandidatePhotoSources(input).src;
}

export function normalizeCandidateKey(name: string) {
  return (name ?? "")
    .trim()
    .toLocaleUpperCase("tr-TR")
    .replace(/İ/g, "I")
    .replace(/Ş/g, "S")
    .replace(/Ğ/g, "G")
    .replace(/Ü/g, "U")
    .replace(/Ö/g, "O")
    .replace(/Ç/g, "C")
    .replace(/[^A-Z0-9 ]/g, "")
    .trim();
}
