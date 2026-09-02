/** Düzce ilçeleri — nöbetçi eczane filtresi. */
export const DUZCE_DISTRICTS = [
  { slug: "merkez", name: "Merkez" },
  { slug: "akcakoca", name: "Akçakoca" },
  { slug: "cumayeri", name: "Cumayeri" },
  { slug: "cilimli", name: "Çilimli" },
  { slug: "golyaka", name: "Gölyaka" },
  { slug: "gumusova", name: "Gümüşova" },
  { slug: "kaynasli", name: "Kaynaşlı" },
  { slug: "yigilca", name: "Yığılca" },
] as const;

export type DutyPharmacy = {
  name: string;
  address: string;
  phone: string;
  district?: string;
};

/** Düzce Belediyesi'nin kullandığı eczaneleri.org widget anahtarı (genel erişim). */
export const DEFAULT_EZCANE_WIDGET_KEY = "e27d63d517814f09f2b4128615887d76";

export function getEczaneWidgetKey() {
  return process.env.ECZANE_WIDGET_KEY?.trim() || DEFAULT_EZCANE_WIDGET_KEY;
}

export function buildPharmacyWidgetUrl(districtSlug?: string | null) {
  const key = getEczaneWidgetKey();
  const base = `https://widget.eczaneleri.org/api/widget/iframe.php?key=${encodeURIComponent(key)}`;
  if (!districtSlug || districtSlug === "merkez") return base;
  const district = DUZCE_DISTRICTS.find((d) => d.slug === districtSlug);
  if (!district) return base;
  return `${base}&ilce=${encodeURIComponent(district.name)}`;
}

export async function fetchDutyPharmaciesFromCollectApi(
  city = "Düzce",
  district?: string,
): Promise<DutyPharmacy[] | null> {
  const apiKey = process.env.COLLECTAPI_APIKEY?.trim();
  if (!apiKey) return null;

  const params = new URLSearchParams({ il: city });
  if (district) params.set("ilce", district);

  try {
    const res = await fetch(`https://api.collectapi.com/health/dutyPharmacy?${params}`, {
      headers: {
        authorization: `apikey ${apiKey}`,
        "content-type": "application/json",
      },
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      success?: boolean;
      result?: Array<{ name?: string; address?: string; phone?: string; dist?: string }>;
    };
    if (!json.success || !Array.isArray(json.result)) return null;
    return json.result
      .map((row) => ({
        name: (row.name ?? "").trim(),
        address: (row.address ?? "").trim(),
        phone: (row.phone ?? "").trim(),
        district: row.dist?.trim(),
      }))
      .filter((row) => row.name && row.address);
  } catch {
    return null;
  }
}
