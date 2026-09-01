import { DEFAULT_PARTY_COLORS, DUZCE_DISTRICTS, computeVotePct } from "@/lib/election";
import { resolveCandidatePhotoUrl } from "@/lib/election-candidate-photo";
import {
  fetchYskDistrictBoxStats,
  fetchYskDistrictCandidates,
  fetchYskDistrictResults,
  fetchYskFocusDistrictResult,
  fetchYskResultHeaders,
  normalizeYskParty,
  normalizeYskPlace,
  readYskVoteColumn,
  type YskElectionConfig,
  type YskSandikResultRow,
} from "@/lib/ysk-api";

const YSK_ILCE_TO_SLUG: Record<string, string> = {
  "DÜZCE MERKEZ": "merkez",
  AKÇAKOCA: "akcakoca",
  CUMAYERİ: "cumayeri",
  ÇİLİMLİ: "cilimli",
  GÖLYAKA: "golyaka",
  GÜMÜŞOVA: "gumusova",
  KAYNAŞLI: "kaynasli",
  YIĞILCA: "yigilca",
};

export type YskSyncCandidate = {
  raceType: "MAYOR";
  name: string;
  partyName: string;
  partyColor: string;
  votes: number;
  votePct: number;
};

export type YskSyncDistrict = {
  name: string;
  slug: string;
  order: number;
  totalBoxes: number;
  openBoxes: number;
  turnoutPct: number;
};

export type YskSyncPayload = {
  totalBoxes: number;
  openBoxes: number;
  totalVoters: number;
  usedVotes: number;
  validVotes: number;
  candidates: YskSyncCandidate[];
  districts: YskSyncDistrict[];
};

function partyColor(partyName: string) {
  const direct = DEFAULT_PARTY_COLORS[partyName];
  if (direct) return direct;
  const upper = partyName.toLocaleUpperCase("tr-TR");
  for (const [key, color] of Object.entries(DEFAULT_PARTY_COLORS)) {
    if (upper.includes(key.toLocaleUpperCase("tr-TR"))) return color;
  }
  return "#d0021b";
}

function displayPartyName(raw: string) {
  const map: Record<string, string> = {
    "AK PARTİ": "AK Parti",
    "AK PARTI": "AK Parti",
    CHP: "CHP",
    MHP: "MHP",
    "İYİ PARTİ": "İYİ Parti",
    "IYI PARTI": "İYİ Parti",
    "YENİDEN REFAH": "Yeniden Refah",
    "DEM PARTI": "DEM Parti",
    "DEM PARTİ": "DEM Parti",
  };
  const key = normalizeYskParty(raw);
  return map[key] ?? raw.trim();
}

function slugForYskIlce(name: string) {
  const normalized = normalizeYskPlace(name);
  if (YSK_ILCE_TO_SLUG[normalized]) return YSK_ILCE_TO_SLUG[normalized]!;
  const fromList = DUZCE_DISTRICTS.find((d) => normalizeYskPlace(d.name) === normalized);
  if (fromList) return fromList.slug;
  return normalized
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function districtDisplayName(slug: string, yskName: string) {
  const known = DUZCE_DISTRICTS.find((d) => d.slug === slug);
  return known?.name ?? (yskName.replace(/^DÜZCE\s+/i, "").trim() || yskName);
}

function findDistrictRow(rows: YskSandikResultRow[], ilceName: string) {
  const target = normalizeYskPlace(ilceName);
  return rows.find((row) => normalizeYskPlace(row.ilce_ADI) === target && !row.belde_ADI);
}

export async function buildYskSyncPayload(config: YskElectionConfig): Promise<YskSyncPayload> {
  const [headers, districtRows, boxStats, focusRow, candidateRows] = await Promise.all([
    fetchYskResultHeaders(config),
    fetchYskDistrictResults(config),
    fetchYskDistrictBoxStats(config),
    fetchYskFocusDistrictResult(config),
    fetchYskDistrictCandidates(config),
  ]);

  const focusIlce = normalizeYskPlace(config.focusIlce);
  const focusCandidates = candidateRows.filter(
    (row) => normalizeYskPlace(row.ilce_ADI) === focusIlce && !row.belde_ADI,
  );

  const validVotes = Number(focusRow.gecerli_OY_TOPLAMI) || 0;
  const usedVotes = Number(focusRow.oy_KULLANAN_SECMEN_SAYISI) || 0;

  const partyHeaders = headers.filter((h) => h.column_NAME.startsWith("parti"));
  const candidateByParty = new Map<string, { name: string; partyName: string }>();
  for (const row of focusCandidates) {
    candidateByParty.set(normalizeYskParty(row.parti_KISA_ADI), {
      name: row.adi_SOYADI.trim(),
      partyName: displayPartyName(row.parti_KISA_ADI),
    });
  }

  const candidates: YskSyncCandidate[] = partyHeaders
    .map((header) => {
      const votes = readYskVoteColumn(focusRow, header.column_NAME);
      if (votes <= 0) return null;
      const mapped = candidateByParty.get(normalizeYskParty(header.ad));
      const partyName = mapped?.partyName ?? displayPartyName(header.ad);
      const name = mapped?.name ?? partyName;
      return {
        raceType: "MAYOR" as const,
        name,
        partyName,
        partyColor: partyColor(partyName),
        votes,
        votePct: computeVotePct(votes, validVotes),
      };
    })
    .filter((item): item is YskSyncCandidate => Boolean(item))
    .sort((a, b) => b.votes - a.votes);

  const boxByIlce = new Map(boxStats.map((row) => [normalizeYskPlace(row.ilce_ADI), row]));

  let totalBoxes = 0;
  let totalVoters = 0;
  let sumUsedVotes = 0;
  let sumValidVotes = 0;

  const districts: YskSyncDistrict[] = districtRows
    .filter((row) => {
      if (!row.ilce_ADI || row.belde_ADI) return false;
      const name = normalizeYskPlace(row.ilce_ADI);
      return Object.prototype.hasOwnProperty.call(YSK_ILCE_TO_SLUG, name);
    })
    .map((row, order) => {
      const ilceName = String(row.ilce_ADI);
      const slug = slugForYskIlce(ilceName);
      const box = boxByIlce.get(normalizeYskPlace(ilceName));
      const total = box?.sandik_SAYISI ?? box?.toplam_SANDIK_SAYISI ?? 0;
      const voters = box?.secmen_SAYISI ?? 0;
      const used = Number(row.oy_KULLANAN_SECMEN_SAYISI) || 0;
      const valid = Number(row.gecerli_OY_TOPLAMI) || 0;
      totalBoxes += total;
      totalVoters += voters;
      sumUsedVotes += used;
      sumValidVotes += valid;
      const turnoutPct = voters > 0 ? Math.round((used / voters) * 10000) / 100 : 0;
      return {
        name: districtDisplayName(slug, ilceName),
        slug,
        order,
        totalBoxes: total,
        openBoxes: total,
        turnoutPct,
      };
    });

  const missing = DUZCE_DISTRICTS.filter(
    (d) => !districts.some((item) => item.slug === d.slug),
  ).map((d, index) => ({
    name: d.name,
    slug: d.slug,
    order: districts.length + index,
    totalBoxes: 0,
    openBoxes: 0,
    turnoutPct: 0,
  }));

  return {
    totalBoxes,
    openBoxes: totalBoxes,
    totalVoters,
    usedVotes: usedVotes || sumUsedVotes,
    validVotes: validVotes || sumValidVotes,
    candidates: candidates.length > 0 ? candidates : [],
    districts: [...districts, ...missing],
  };
}

export function mergeYskCandidates<T extends { name: string; partyName: string; partyColor: string; photoUrl?: string | null; slogan?: string | null; bio?: string | null; votes: number; votePct: number }>(
  existing: T[],
  incoming: YskSyncCandidate[],
) {
  const used = new Set<number>();
  const merged = incoming.map((candidate) => {
    const matchIndex = existing.findIndex(
      (item, index) =>
        !used.has(index) &&
        (normalizeYskParty(item.partyName) === normalizeYskParty(candidate.partyName) ||
          normalizeYskPlace(item.name) === normalizeYskPlace(candidate.name)),
    );
    if (matchIndex >= 0) {
      used.add(matchIndex);
      const prev = existing[matchIndex]!;
      return {
        ...prev,
        name: candidate.name,
        partyName: candidate.partyName,
        partyColor: candidate.partyColor,
        votes: candidate.votes,
        votePct: candidate.votePct,
      };
    }
    return {
      ...candidate,
      slogan: null,
      bio: null,
      photoUrl: resolveCandidatePhotoUrl({
        name: candidate.name,
        partyName: candidate.partyName,
        partyColor: candidate.partyColor,
      }),
    };
  });
  return merged;
}
