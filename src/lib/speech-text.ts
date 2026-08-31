import { expandNewsAbbreviations } from "@/lib/speech-abbreviations";

const ONES = ["", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"];
const TENS = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"];
const ORD_ONES = [
  "",
  "birinci",
  "ikinci",
  "üçüncü",
  "dördüncü",
  "beşinci",
  "altıncı",
  "yedinci",
  "sekizinci",
  "dokuzuncu",
];
const ORD_TENS = [
  "",
  "onuncu",
  "yirminci",
  "otuzuncu",
  "kırkıncı",
  "ellinci",
  "altmışıncı",
  "yetmişinci",
  "sekseninci",
  "doksanıncı",
];

const MONTHS = [
  "ocak",
  "şubat",
  "mart",
  "nisan",
  "mayıs",
  "haziran",
  "temmuz",
  "ağustos",
  "eylül",
  "ekim",
  "kasım",
  "aralık",
] as const;

const MONTH_RE = MONTHS.join("|");

function underThousand(n: number) {
  if (n <= 0) return "";
  const parts: string[] = [];
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  if (hundreds === 1) parts.push("yüz");
  else if (hundreds > 1) parts.push(`${ONES[hundreds]} yüz`);
  const tens = Math.floor(rest / 10);
  const ones = rest % 10;
  if (tens) parts.push(TENS[tens]);
  if (ones) parts.push(ONES[ones]);
  return parts.join(" ");
}

export function cardinal(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  n = Math.trunc(n);
  if (n === 0) return "sıfır";
  if (n < 0) return `eksi ${cardinal(-n)}`;

  const parts: string[] = [];
  const milyar = Math.floor(n / 1_000_000_000);
  n %= 1_000_000_000;
  const milyon = Math.floor(n / 1_000_000);
  n %= 1_000_000;
  const bin = Math.floor(n / 1_000);
  const rest = n % 1_000;

  if (milyar) parts.push(milyar === 1 ? "bir milyar" : `${underThousand(milyar)} milyar`);
  if (milyon) parts.push(milyon === 1 ? "bir milyon" : `${underThousand(milyon)} milyon`);
  if (bin) parts.push(bin === 1 ? "bin" : `${underThousand(bin)} bin`);
  if (rest) parts.push(underThousand(rest));
  return parts.join(" ");
}

export function yearWords(year: number) {
  if (year >= 2000 && year <= 2099) {
    const rest = year - 2000;
    return rest === 0 ? "iki bin" : `iki bin ${cardinal(rest)}`;
  }
  if (year >= 1000 && year <= 1999) {
    const rest = year - 1000;
    return rest === 0 ? "bin" : `bin ${cardinal(rest)}`;
  }
  return cardinal(year);
}

export function ordinal(n: number): string {
  if (n === 0) return "sıfırıncı";
  if (n < 0) return cardinal(n);
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    const rest = n % 1000;
    const head = thousands === 1 ? "bin" : `${underThousand(thousands)} bin`;
    if (rest === 0) return `${head}inci`;
    return `${head} ${ordinal(rest)}`;
  }
  if (n >= 100) {
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    const head = hundreds === 1 ? "yüz" : `${ONES[hundreds]} yüz`;
    if (rest === 0) return `${head}üncü`;
    return `${head} ${ordinal(rest)}`;
  }
  if (n >= 10) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    if (ones === 0) return ORD_TENS[tens];
    return `${TENS[tens]} ${ORD_ONES[ones]}`;
  }
  return ORD_ONES[n];
}

function spokenTime(hour: number, minute: number, suffix?: string) {
  const hourWords = cardinal(hour);
  const spoken =
    minute === 0 ? `saat ${hourWords}` : `saat ${hourWords} ${minute < 10 ? `sıfır ${cardinal(minute)}` : cardinal(minute)}`;
  if (!suffix) return spoken;
  const s = suffix.toLocaleLowerCase("tr-TR");
  if (/^[dt][ae]$/.test(s)) return `${spoken}${s.replace("t", "d")}`;
  return `${spoken}'${s}`;
}

function parseTrInt(raw: string) {
  if (/^\d{1,3}(\.\d{3})+$/.test(raw)) return Number(raw.replace(/\./g, ""));
  if (/^\d+$/.test(raw)) return Number(raw);
  return null;
}

function spokenDecimal(raw: string) {
  const [left, right] = raw.split(",");
  const whole = cardinal(Number(left));
  if (!right) return whole;
  if (right.length <= 2) return `${whole} virgül ${cardinal(Number(right))}`;
  return `${whole} virgül ${[...right].map((d) => cardinal(Number(d))).join(" ")}`;
}

function spokenPhone(digits: string) {
  const d = digits.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("0")) {
    return [
      `sıfır ${cardinal(Number(d.slice(1, 4)))}`,
      cardinal(Number(d.slice(4, 7))),
      cardinal(Number(d.slice(7, 9))),
      cardinal(Number(d.slice(9, 11))),
    ].join(" ");
  }
  if (d.length === 10) {
    return [
      cardinal(Number(d.slice(0, 3))),
      cardinal(Number(d.slice(3, 6))),
      cardinal(Number(d.slice(6, 8))),
      cardinal(Number(d.slice(8, 10))),
    ].join(" ");
  }
  return [...d].map((ch) => cardinal(Number(ch))).join(" ");
}

function monthName(index: number) {
  return MONTHS[index - 1] ?? String(index);
}

function spokenDate(day: number, month: string | number, year?: number) {
  const monthWord = typeof month === "number" ? monthName(month) : month.toLocaleLowerCase("tr-TR");
  const parts = [cardinal(day), monthWord];
  if (year != null) parts.push(yearWords(year));
  return parts.join(" ");
}

function spokenAmount(raw: string) {
  if (raw.includes(",")) return spokenDecimal(raw);
  return cardinal(parseTrInt(raw) ?? Number(raw));
}

function holdTokens(text: string) {
  const held: string[] = [];
  const stash = (value: string) => {
    held.push(value);
    return `\u0000${held.length - 1}\u0000`;
  };
  let out = text.replace(/https?:\/\/\S+/gi, stash);
  out = out.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, stash);
  return { out, held };
}

function restoreTokens(text: string, held: string[]) {
  return text.replace(/\u0000(\d+)\u0000/g, (_, i) => held[Number(i)] ?? "");
}

function softenPunctuation(text: string) {
  return text
    .replace(/\u0002|\u0003/g, "")
    .replace(/[.]{2,}|…/g, ".")
    .replace(/!+/g, ".")
    .replace(/\s*[–—]\s*/g, ", ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

const ORDINAL_NOUNS = "yıl|yılı|kez|madde|lig|sınıf|dakika|dakikada|dönem|hafta|sıra|sırada|kat";

export function toSpokenNewsText(text: string) {
  const { out: heldText, held } = holdTokens(text);
  let out = softenPunctuation(heldText);
  out = expandNewsAbbreviations(out);
  out = out.replace(/(?<!Türk\s)Kızılay/g, "Türk Kızılay");

  out = out.replace(
    new RegExp(`\\b(\\d{1,2})\\s+(${MONTH_RE})\\s+(\\d{4})\\b`, "gi"),
    (_, day, month, year) => spokenDate(Number(day), month, Number(year)),
  );
  out = out.replace(new RegExp(`\\b(\\d{1,2})\\s+(${MONTH_RE})\\b`, "gi"), (_, day, month) =>
    spokenDate(Number(day), month),
  );
  out = out.replace(/\b(\d{1,2})[./](\d{1,2})[./](\d{4})\b/g, (_, d, m, y) => {
    const month = Number(m);
    if (month < 1 || month > 12) return `${d}.${m}.${y}`;
    return spokenDate(Number(d), month, Number(y));
  });

  out = out.replace(/\b(\d{4})\s*[-/]\s*(\d{4})\s+sezonu\b/gi, (_, a, b) => `${yearWords(Number(a))}, ${yearWords(Number(b))} sezonu`);
  out = out.replace(/\b(\d{2})\s*\/\s*(\d{2})\s+sezonu\b/gi, (_, a, b) => `${cardinal(Number(a))}, ${cardinal(Number(b))} sezonu`);

  out = out.replace(/\b(?:saat\s+)?([01]?\d|2[0-3])[:.]([0-5]\d)(?:['']([A-Za-zçğıöşü]+))?(?!\d)/gi, (_, h, min, suffix) =>
    spokenTime(Number(h), Number(min), suffix),
  );

  out = out.replace(/\bKat:\s*(\d+)\b/gi, (_, n) => `${ordinal(Number(n))} kat`);
  out = out.replace(/\bD:\s*(\d+)\b/g, (_, n) => `daire ${cardinal(Number(n))}`);
  out = out.replace(/\b(madde)\s+(\d+)\b/gi, (_, _w, n) => `madde ${cardinal(Number(n))}`);

  out = out.replace(/%\s*(\d+(?:[.,]\d+)?)/g, (_, n) => `yüzde ${spokenAmount(n)}`);
  out = out.replace(/\b(\d+(?:[.,]\d+)?)\s*%/g, (_, n) => `yüzde ${spokenAmount(n)}`);
  out = out.replace(/\byüzde\s+(\d+(?:[.,]\d+)?)\b/gi, (_, n) => `yüzde ${spokenAmount(n)}`);

  out = out.replace(new RegExp(`\\b(\\d+)\\.\\s*(${ORDINAL_NOUNS})\\b`, "gi"), (_, n, word) => {
    return `${ordinal(Number(n))} ${word.toLocaleLowerCase("tr-TR")}`;
  });

  out = out.replace(/\b(\d+(?:[.,]\d+)?)\s*°\s*C\b/gi, (_, n) => `${spokenAmount(n)} derece`);
  out = out.replace(/\b(\d+(?:[.,]\d+)?)\s*km\/sa(?:at)?\b/gi, (_, n) => `${spokenAmount(n)} kilometre saat`);
  out = out.replace(/\b(\d+(?:[.,]\d+)?)\s*km\/s\b/gi, (_, n) => `${spokenAmount(n)} kilometre bölü saat`);
  out = out.replace(/\b(\d+(?:[.,]\d+)?)\s*km²\b/gi, (_, n) => `${spokenAmount(n)} kilometrekare`);
  out = out.replace(/\b(\d+(?:[.,]\d+)?)\s*m²\b/gi, (_, n) => `${spokenAmount(n)} metrekare`);
  out = out.replace(/\b(\d+(?:[.,]\d+)?)\s*km\b/gi, (_, n) => `${spokenAmount(n)} kilometre`);
  out = out.replace(/\b(\d+(?:[.,]\d+)?)\s*kg\b/gi, (_, n) => `${spokenAmount(n)} kilogram`);
  out = out.replace(/\b(\d+(?:[.,]\d+)?)\s*ml\b/gi, (_, n) => `${spokenAmount(n)} mililitre`);
  out = out.replace(/\b(\d+(?:[.,]\d+)?)\s*L\b/g, (_, n) => `${spokenAmount(n)} litre`);
  out = out.replace(/\b(\d+(?:[.,]\d+)?)\s+g\b/g, (_, n) => `${spokenAmount(n)} gram`);
  out = out.replace(/\b(\d+(?:[.,]\d+)?)\s+m\b/g, (_, n) => `${spokenAmount(n)} metre`);

  out = out.replace(/\bD[-\s]?(\d{2,3})\b/g, (_, n) => `D ${cardinal(Number(n))}`);
  out = out.replace(/\bE[-\s]?(\d)\b/g, (_, n) => `E ${cardinal(Number(n))}`);
  out = out.replace(/\bF[-\s]?(\d{2})\b/g, (_, n) => `F ${cardinal(Number(n))}`);

  out = out.replace(/\b0\d{3}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}\b/g, (m) => spokenPhone(m));
  out = out.replace(/\b(\d{2})\s+([A-ZÇĞİÖŞÜ]{1,3})\s+(\d{2,4})\b/g, (_, code, letters, num) => {
    return `${cardinal(Number(code))} ${[...letters].join(" ")} ${cardinal(Number(num))}`;
  });

  out = out.replace(/\b(\d{1,3}(?:\.\d{3})+|\d+)\s*(?:TL|₺)\b/gi, (_, n) => `${spokenAmount(n)} Türk lirası`);
  out = out.replace(/\$\s*(\d{1,3}(?:\.\d{3})+|\d+(?:,\d+)?)/g, (_, n) => `${spokenAmount(n)} dolar`);
  out = out.replace(/€\s*(\d{1,3}(?:\.\d{3})+|\d+(?:,\d+)?)/g, (_, n) => `${spokenAmount(n)} avro`);
  out = out.replace(/£\s*(\d{1,3}(?:\.\d{3})+|\d+(?:,\d+)?)/g, (_, n) => `${spokenAmount(n)} sterlin`);

  out = out.replace(/\b\d{1,3}(?:\.\d{3})+\b/g, (n) => cardinal(parseTrInt(n) ?? 0));
  out = out.replace(/\b\d+,\d+\b/g, (n) => spokenDecimal(n));
  out = out.replace(/\b(19|20)\d{2}\b/g, (n) => yearWords(Number(n)));
  out = out.replace(/\b\d{1,7}\b/g, (n) => cardinal(Number(n)));

  out = out.replace(/\bTL\b/g, "Türk lirası");
  out = restoreTokens(out, held);
  return out.replace(/[ \t]{2,}/g, " ").replace(/\s+,/g, ",").replace(/,\s*,/g, ",").replace(/\n{3,}/g, "\n\n").trim();
}
