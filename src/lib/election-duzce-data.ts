import { resolvePartyColor } from "@/lib/election-candidate-photo";

/** 2024 Düzce ilçe liderleri — NTV/YSK sonuçları (demo yedek veri). */
export const DUZCE_2024_DISTRICT_LEADERS: Record<
  string,
  {
    leadingName: string;
    leadingParty: string;
    leadingPartyColor: string;
    leadingVotes: number;
    leadingPct: number;
  }
> = {
  akcakoca: {
    leadingName: "Fikret Albayrak",
    leadingParty: "CHP",
    leadingPartyColor: resolvePartyColor("CHP"),
    leadingVotes: 6131,
    leadingPct: 37.41,
  },
  merkez: {
    leadingName: "Faruk Özlü",
    leadingParty: "AK Parti",
    leadingPartyColor: resolvePartyColor("AK Parti"),
    leadingVotes: 41233,
    leadingPct: 40.22,
  },
  yigilca: {
    leadingName: "Selami Savaş",
    leadingParty: "AK Parti",
    leadingPartyColor: resolvePartyColor("AK Parti"),
    leadingVotes: 732,
    leadingPct: 36.15,
  },
  cumayeri: {
    leadingName: "Mustafa Koloğlu",
    leadingParty: "MHP",
    leadingPartyColor: resolvePartyColor("MHP"),
    leadingVotes: 2794,
    leadingPct: 42.45,
  },
  golyaka: {
    leadingName: "Muzaffer Coşkun",
    leadingParty: "MHP",
    leadingPartyColor: resolvePartyColor("MHP"),
    leadingVotes: 2519,
    leadingPct: 33.8,
  },
  cilimli: {
    leadingName: "Yılmaz Yıldız",
    leadingParty: "AK Parti",
    leadingPartyColor: resolvePartyColor("AK Parti"),
    leadingVotes: 2392,
    leadingPct: 47.49,
  },
  gumusova: {
    leadingName: "Kenan Sübekci",
    leadingParty: "AK Parti",
    leadingPartyColor: resolvePartyColor("AK Parti"),
    leadingVotes: 2909,
    leadingPct: 49.11,
  },
  kaynasli: {
    leadingName: "Efdal Altundal",
    leadingParty: "MHP",
    leadingPartyColor: resolvePartyColor("MHP"),
    leadingVotes: 1988,
    leadingPct: 32.38,
  },
};
