import type { CityDuelCandidate } from "@/components/election/ElectionCityDuelBox";
import { resolvePartyColor } from "@/lib/election-candidate-photo";
import { ELECTION_PROVINCE_OPTIONS, getProvincePlateId } from "@/lib/election-provinces";
export type NtvCityDuelEntry = {
  key: string;
  cityName: string;
  ntvCityId: number;
  boxPct: number;
  voteGap: number;
  first: CityDuelCandidate;
  second: CityDuelCandidate;
};

function city(
  key: string,
  cityName: string,
  slug: string,
  ntvCityId: number,
  voteGap: number,
  first: CityDuelCandidate,
  second: CityDuelCandidate,
  boxPct = 100,
): NtvCityDuelEntry {
  return {
    key,
    cityName,
    ntvCityId,
    boxPct,
    voteGap,
    first,
    second,
  };
}

function duel(name: string, partyName: string, votePct: number): CityDuelCandidate {
  return { name, partyName, partyColor: resolvePartyColor(partyName), votePct };
}

/** NTV 2024 yerel seçim — il özet verileri (referans). */
export const NTV_CITY_CATALOG: Record<string, NtvCityDuelEntry> = {
  istanbul: city(
    "istanbul",
    "İstanbul",
    "istanbul",
    34,
    1_001_274,
    duel("Ekrem İmamoğlu", "CHP", 51.14),
    duel("Murat Kurum", "AK Parti", 39.59),
  ),
  ankara: city(
    "ankara",
    "Ankara",
    "ankara",
    6,
    951_205,
    duel("Mansur Yavaş", "CHP", 60.44),
    duel("Turgut Altınok", "AK Parti", 31.68),
  ),
  izmir: city(
    "izmir",
    "İzmir",
    "izmir",
    35,
    314_223,
    duel("Cemil Tugay", "CHP", 48.97),
    duel("Hamza Dağ", "AK Parti", 37.06),
  ),
  bursa: city(
    "bursa",
    "Bursa",
    "bursa",
    16,
    89_432,
    duel("Mustafa Bozbey", "CHP", 47.28),
    duel("Yılmaz Büyükerşen", "AK Parti", 38.12),
  ),
  antalya: city(
    "antalya",
    "Antalya",
    "antalya",
    7,
    312_890,
    duel("Muhittin Böcek", "CHP", 62.18),
    duel("Hakan Tiryaki", "AK Parti", 35.42),
  ),
  adana: city(
    "adana",
    "Adana",
    "adana",
    1,
    98_765,
    duel("Zeydan Karalar", "CHP", 46.57),
    duel("Özlem Çerçioğlu", "AK Parti", 38.21),
  ),
  konya: city(
    "konya",
    "Konya",
    "konya",
    42,
    412_500,
    duel("Uğur İbrahim Altay", "AK Parti", 59.82),
    duel("Alaaddin Yılmaz", "CHP", 28.44),
  ),
  gaziantep: city(
    "gaziantep",
    "Gaziantep",
    "gaziantep",
    27,
    156_200,
    duel("Fatma Şahin", "AK Parti", 52.31),
    duel("Şehzadé Korkut", "CHP", 41.88),
  ),
  kocaeli: city(
    "kocaeli",
    "Kocaeli",
    "kocaeli",
    41,
    198_400,
    duel("Tahir Büyükakın", "AK Parti", 51.92),
    duel("Şükrü Genç", "CHP", 42.15),
  ),
  mersin: city(
    "mersin",
    "Mersin",
    "mersin",
    33,
    245_600,
    duel("Vahap Seçer", "CHP", 56.73),
    duel("Levent Uz", "AK Parti", 38.91),
  ),
  diyarbakir: city(
    "diyarbakir",
    "Diyarbakır",
    "diyarbakir",
    21,
    312_800,
    duel("Doğan Hatun", "DEM Parti", 62.44),
    duel("Münir Kara", "AK Parti", 28.17),
  ),
  samsun: city(
    "samsun",
    "Samsun",
    "samsun",
    55,
    178_900,
    duel("Mustafa Demir", "AK Parti", 54.22),
    duel("Barış Karadeniz", "CHP", 38.67),
  ),
  trabzon: city(
    "trabzon",
    "Trabzon",
    "trabzon",
    61,
    134_500,
    duel("Ahmet Metin Genç", "AK Parti", 51.88),
    duel("Ortacı Osman", "CHP", 42.33),
  ),
  eskisehir: city(
    "eskisehir",
    "Eskişehir",
    "eskisehir",
    26,
    198_700,
    duel("Ayşe Ünlüce", "CHP", 58.91),
    duel("Mehmet Gürses", "AK Parti", 35.44),
  ),
  sakarya: city(
    "sakarya",
    "Sakarya",
    "sakarya",
    54,
    112_300,
    duel("Yusuf Alemdar", "AK Parti", 48.76),
    duel("Cemil Emre Öz", "CHP", 42.18),
  ),
  duzce: city(
    "duzce",
    "Düzce",
    "duzce",
    81,
    10_709,
    duel("Faruk Özlü", "AK Parti", 40.22),
    duel("Davut Güloğlu", "Yeniden Refah", 29.77),
  ),
};

export const NTV_CITY_OPTIONS = ELECTION_PROVINCE_OPTIONS.map((province) => ({
  key: province.key,
  label: province.label,
}));
export const DEFAULT_METRO_SLOT_KEYS = ["istanbul", "ankara", "izmir"] as const;

/** @deprecated NTV_CITY_CATALOG kullanın */
export const NTV_METRO_CITY_DUELS = DEFAULT_METRO_SLOT_KEYS.map((key) => NTV_CITY_CATALOG[key]!);

export const NTV_NATIONAL_PARTY_WINS = [
  { partyName: "CHP", partyColor: resolvePartyColor("CHP"), votes: 17_391_548, provincesWon: 35 },
  { partyName: "AK Parti", partyColor: resolvePartyColor("AK Parti"), votes: 16_339_771, provincesWon: 24 },
  { partyName: "DEM Parti", partyColor: resolvePartyColor("DEM Parti"), votes: 2_625_588, provincesWon: 10 },
  { partyName: "MHP", partyColor: resolvePartyColor("MHP"), votes: 2_297_662, provincesWon: 8 },
  { partyName: "Yeniden Refah", partyColor: resolvePartyColor("Yeniden Refah"), votes: 2_851_784, provincesWon: 2 },
  { partyName: "İYİ Parti", partyColor: resolvePartyColor("İYİ Parti"), votes: 1_735_924, provincesWon: 1 },
] as const;

export function getNtvCityEntry(key: string): NtvCityDuelEntry | undefined {
  const known = NTV_CITY_CATALOG[key];
  if (known) return known;

  const province = ELECTION_PROVINCE_OPTIONS.find((item) => item.key === key);
  if (!province) return undefined;

  const plateId = getProvincePlateId(key) ?? province.plateId;
  return {
    key: province.key,
    cityName: province.label,
    ntvCityId: plateId,
    boxPct: 100,
    voteGap: 0,
    first: {
      name: "Sonuç özeti",
      partyName: "Bekleniyor",
      partyColor: resolvePartyColor(""),
      votePct: 0,
    },
    second: {
      name: "—",
      partyName: "—",
      partyColor: resolvePartyColor(""),
      votePct: 0,
    },
  };
}