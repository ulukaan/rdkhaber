import { cache } from "react";

const TCMB_URL = "https://www.tcmb.gov.tr/kurlar/today.xml";
const TRUNCGIL_URL = "https://finans.truncgil.com/v4/today.json";
const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,binancecoin&vs_currencies=try&include_24hr_change=true";
const YAHOO_SPARK_URL =
  "https://query1.finance.yahoo.com/v7/finance/spark?symbols=THYAO.IS,GARAN.IS,AKBNK.IS,ASELS.IS,BIMAS.IS,EREGL.IS,BZ=F&range=1d&interval=1d";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const FX_CODES: Array<{ code: string; label: string }> = [
  { code: "USD", label: "Dolar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "Sterlin" },
  { code: "CHF", label: "Frang" },
  { code: "SAR", label: "Riyal" },
  { code: "AED", label: "Dirhem" },
];

const METAL_CODES: Array<{ code: string; label: string; digits: number }> = [
  { code: "GRA", label: "Gram Altın", digits: 2 },
  { code: "GUMUS", label: "Gümüş", digits: 2 },
  { code: "CEYREKALTIN", label: "Çeyrek", digits: 0 },
];

const CRYPTO_CODES: Array<{
  id: string;
  code: string;
  label: string;
  digits: number;
}> = [
  { id: "bitcoin", code: "BTC", label: "Bitcoin", digits: 0 },
  { id: "ethereum", code: "ETH", label: "Ethereum", digits: 0 },
  { id: "binancecoin", code: "BNB", label: "BNB", digits: 0 },
  { id: "solana", code: "SOL", label: "Solana", digits: 2 },
  { id: "ripple", code: "XRP", label: "XRP", digits: 2 },
];

const STOCK_CODES: Array<{ symbol: string; label: string }> = [
  { symbol: "THYAO.IS", label: "THYAO" },
  { symbol: "GARAN.IS", label: "GARAN" },
  { symbol: "AKBNK.IS", label: "AKBNK" },
  { symbol: "ASELS.IS", label: "ASELS" },
  { symbol: "BIMAS.IS", label: "BIMAS" },
  { symbol: "EREGL.IS", label: "EREGL" },
];

export type MarketItem = {
  code: string;
  label: string;
  value: number;
  change: number | null;
  suffix: string;
  digits: number;
};

export type MarketGroup = {
  id: "fx" | "metal" | "index" | "crypto";
  label: string;
  items: MarketItem[];
};

export type RatesSnapshot = {
  date: string | null;
  groups: MarketGroup[];
};

type TruncgilQuote = {
  Buying?: number;
  Selling?: number;
  Change?: number;
};

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  return null;
}

function readQuote(data: Record<string, unknown>, key: string) {
  const row = data[key];
  if (!row || typeof row !== "object") return null;
  const quote = row as TruncgilQuote;
  const value = asNumber(quote.Selling) ?? asNumber(quote.Buying);
  if (!value) return null;
  return {
    value,
    change: typeof quote.Change === "number" && Number.isFinite(quote.Change) ? quote.Change : null,
  };
}

async function fetchJson<T>(url: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": BROWSER_UA },
      next: { revalidate },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function readTag(block: string, tag: string) {
  const match = new RegExp(`<${tag}>([^<]*)</${tag}>`).exec(block);
  const value = match?.[1]?.trim();
  return value ? Number(value) : null;
}

export function parseTcmbXml(xml: string): MarketItem[] {
  if (!xml.includes("<Currency")) return [];

  const blocks = xml.matchAll(/<Currency[^>]*Kod="([A-Z]+)"[^>]*>([\s\S]*?)<\/Currency>/g);
  const found = new Map<string, MarketItem>();

  for (const match of blocks) {
    const code = match[1];
    const target = FX_CODES.find((s) => s.code === code);
    if (!target) continue;

    const block = match[2];
    const buying = readTag(block, "ForexBuying");
    const selling = readTag(block, "ForexSelling");
    const unit = readTag(block, "Unit") || 1;
    if (!buying || !selling) continue;

    found.set(code, {
      code,
      label: target.label,
      value: selling / unit,
      change: null,
      suffix: "₺",
      digits: 4,
    });
  }

  return FX_CODES.map((s) => found.get(s.code)).filter((r): r is MarketItem => Boolean(r));
}

function parseTruncgil(data: Record<string, unknown>) {
  const fx: MarketItem[] = [];
  for (const row of FX_CODES) {
    const quote = readQuote(data, row.code);
    if (!quote) continue;
    fx.push({
      code: row.code,
      label: row.label,
      value: quote.value,
      change: quote.change,
      suffix: "₺",
      digits: 4,
    });
  }

  const metal: MarketItem[] = [];
  for (const row of METAL_CODES) {
    const quote = readQuote(data, row.code);
    if (!quote) continue;
    metal.push({
      code: row.code,
      label: row.label,
      value: quote.value,
      change: quote.change,
      suffix: "₺",
      digits: row.digits,
    });
  }

  const bist = readQuote(data, "XU100");
  const index: MarketItem[] = bist
    ? [
        {
          code: "XU100",
          label: "BIST 100",
          value: bist.value,
          change: bist.change,
          suffix: "",
          digits: 2,
        },
      ]
    : [];

  const date = typeof data.Update_Date === "string" ? data.Update_Date : null;
  return { fx, metal, index, date };
}

function parseCoinGecko(data: Record<string, Record<string, number> | undefined>) {
  const items: MarketItem[] = [];
  for (const row of CRYPTO_CODES) {
    const quote = data[row.id];
    const value = asNumber(quote?.try);
    if (!value) continue;
    const change = quote?.try_24h_change;
    items.push({
      code: row.code,
      label: row.label,
      value,
      change: typeof change === "number" && Number.isFinite(change) ? change : null,
      suffix: "₺",
      digits: row.digits,
    });
  }
  return items;
}

function parseYahooSpark(payload: {
  spark?: {
    result?: Array<{
      symbol?: string;
      response?: Array<{
        meta?: { regularMarketPrice?: number; regularMarketChangePercent?: number };
      }>;
    }>;
  };
}) {
  const rows = payload.spark?.result ?? [];
  const bySymbol = new Map<string, { value: number; change: number | null }>();

  for (const row of rows) {
    const symbol = row.symbol;
    const meta = row.response?.[0]?.meta;
    const value = asNumber(meta?.regularMarketPrice);
    if (!symbol || !value) continue;
    const change = meta?.regularMarketChangePercent;
    bySymbol.set(symbol, {
      value,
      change: typeof change === "number" && Number.isFinite(change) ? change : null,
    });
  }

  const stocks: MarketItem[] = [];
  for (const row of STOCK_CODES) {
    const quote = bySymbol.get(row.symbol);
    if (!quote) continue;
    stocks.push({
      code: row.label,
      label: row.label,
      value: quote.value,
      change: quote.change,
      suffix: "₺",
      digits: 2,
    });
  }

  const brent = bySymbol.get("BZ=F");
  const commodity: MarketItem[] = brent
    ? [
        {
          code: "BRENT",
          label: "Brent",
          value: brent.value,
          change: brent.change,
          suffix: "$",
          digits: 2,
        },
      ]
    : [];

  return { stocks, commodity };
}

function pushGroup(groups: MarketGroup[], group: MarketGroup) {
  if (group.items.length > 0) groups.push(group);
}

export const getRates = cache(async (): Promise<RatesSnapshot | null> => {
  const [truncgil, gecko, yahoo] = await Promise.all([
    fetchJson<Record<string, unknown>>(TRUNCGIL_URL, 60),
    fetchJson<Record<string, Record<string, number>>>(COINGECKO_URL, 60),
    fetchJson<Parameters<typeof parseYahooSpark>[0]>(YAHOO_SPARK_URL, 60),
  ]);

  const fromTruncgil = truncgil ? parseTruncgil(truncgil) : { fx: [], metal: [], index: [], date: null };
  const yahooQuotes = yahoo ? parseYahooSpark(yahoo) : { stocks: [], commodity: [] };
  const crypto = gecko ? parseCoinGecko(gecko) : [];

  let fx = fromTruncgil.fx;
  if (fx.length === 0) {
    try {
      const tcmbRes = await fetch(TCMB_URL, {
        headers: { "User-Agent": BROWSER_UA },
        next: { revalidate: 1800 },
        signal: AbortSignal.timeout(5000),
      });
      if (tcmbRes.ok) fx = parseTcmbXml(await tcmbRes.text());
    } catch {
      fx = [];
    }
  }

  const groups: MarketGroup[] = [];
  pushGroup(groups, { id: "fx", label: "Döviz", items: fx });
  pushGroup(groups, {
    id: "metal",
    label: "Emtia",
    items: [...fromTruncgil.metal, ...yahooQuotes.commodity],
  });
  pushGroup(groups, {
    id: "index",
    label: "Borsa",
    items: [...fromTruncgil.index, ...yahooQuotes.stocks],
  });
  pushGroup(groups, { id: "crypto", label: "Kripto", items: crypto });

  if (groups.length === 0) return null;
  return { date: fromTruncgil.date, groups };
});

export function formatMarketValue(item: MarketItem) {
  return `${item.value.toLocaleString("tr-TR", {
    minimumFractionDigits: item.digits,
    maximumFractionDigits: item.digits,
  })}${item.suffix ? ` ${item.suffix}` : ""}`;
}

export function formatChange(change: number) {
  const abs = Math.abs(change).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (change > 0) return `+${abs}%`;
  if (change < 0) return `−${abs}%`;
  return `${abs}%`;
}

const PARITY_CODES = ["USD", "EUR", "GBP", "GRA", "XU100", "BRENT", "BTC", "ETH"];

export function pickParityItems(snapshot: RatesSnapshot) {
  const all = snapshot.groups.flatMap((g) => g.items);
  const picked: MarketItem[] = [];
  for (const code of PARITY_CODES) {
    const item = all.find((i) => i.code === code);
    if (item) picked.push(item);
  }
  for (const item of all) {
    if (picked.length >= 8) break;
    if (!picked.some((p) => p.code === item.code)) picked.push(item);
  }
  return picked.slice(0, 8);
}
