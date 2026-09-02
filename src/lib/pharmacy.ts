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

const REVALIDATE = 1800;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

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

function unescapeJsString(raw: string) {
  return raw
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\\//g, "/")
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function parseWidgetHtml(html: string): DutyPharmacy[] {
  const blocks = [...html.matchAll(/<div class="eczane">([\s\S]*?)<\/div>/gi)];
  return blocks
    .map((block) => {
      const chunk = block[1];
      const name = (chunk.match(/<a[^>]*>([^<]+)/i)?.[1] ?? "").trim();
      const phone = (
        chunk.match(/class="_p"><\/i>\s*:\s*([^<\n]+)/i)?.[1] ??
        chunk.match(/:\s*(0\d[\d\s]+)/)?.[1] ??
        ""
      ).trim();
      const district = (chunk.match(/<b>([^<]+)<\/b>/i)?.[1] ?? "").trim();
      const addressRaw =
        chunk.match(/class="_a"><\/i>\s*:\s*([\s\S]*?)(?:<\/p>|$)/i)?.[1] ?? "";
      const address = addressRaw
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return { name, phone, address, district: district || undefined };
    })
    .filter((row) => row.name && row.address);
}

function normalizeDistrict(value?: string | null) {
  return (value ?? "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .trim();
}

function filterByDistrict(items: DutyPharmacy[], districtName?: string) {
  if (!districtName || normalizeDistrict(districtName) === "merkez") {
    const merkez = items.filter((item) => {
      const d = normalizeDistrict(item.district);
      return !d || d === "merkez" || d.includes("merkez");
    });
    return merkez.length > 0 ? merkez : items;
  }
  const target = normalizeDistrict(districtName);
  return items.filter((item) => normalizeDistrict(item.district).includes(target));
}

/** Servisler sayfasındaki eczaneleri.org widget’ından liste çıkarır. */
export async function fetchDutyPharmaciesFromWidget(
  districtName?: string,
): Promise<DutyPharmacy[] | null> {
  const key = getEczaneWidgetKey();
  if (!key) return null;

  try {
    const params = new URLSearchParams({
      key,
      type: "iframe",
      ref: "duzceradikal.com",
    });
    if (districtName && normalizeDistrict(districtName) !== "merkez") {
      params.set("ilce", districtName);
    }

    const res = await fetch(`https://widget.eczaneleri.org/api/widget/get.php?${params}`, {
      headers: {
        Accept: "*/*",
        "User-Agent": UA,
        Referer: `https://widget.eczaneleri.org/api/widget/iframe.php?key=${encodeURIComponent(key)}`,
      },
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const js = await res.text();
    const htmlMatch = js.match(/var\s+eorg_html\s*=\s*"((?:\\.|[^"\\])*)"/);
    if (!htmlMatch?.[1]) return null;
    const items = parseWidgetHtml(unescapeJsString(htmlMatch[1]));
    if (items.length === 0) return null;
    return filterByDistrict(items, districtName);
  } catch {
    return null;
  }
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
      next: { revalidate: REVALIDATE },
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

/** CollectAPI varsa onu, yoksa eczaneleri.org widget’ını kullanır. */
export async function getDutyPharmacies(
  city = "Düzce",
  district?: string,
): Promise<DutyPharmacy[]> {
  const fromApi = await fetchDutyPharmaciesFromCollectApi(city, district);
  if (fromApi && fromApi.length > 0) return fromApi;

  const fromWidget = await fetchDutyPharmaciesFromWidget(district);
  return fromWidget ?? [];
}
