import { NEWS_ABBREVIATIONS, type AbbrRule } from "@/lib/speech-lexicon";

const LETTER = /[A-Za-zÇĞİÖŞÜçğıöşüÂâÎîÛû]/;
const NAME_STOP = new Set(["bir", "ve", "ile", "bu", "şu", "o", "the", "a", "an"]);

function escapeRe(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function lastVowel(text: string) {
  const vowels = "aeıioöuü";
  for (let i = text.length - 1; i >= 0; i -= 1) {
    const ch = text[i].toLocaleLowerCase("tr-TR");
    if (vowels.includes(ch)) return ch;
  }
  return "e";
}

function harmony(vowel: string) {
  if ("aı".includes(vowel)) return "back";
  if ("ei".includes(vowel)) return "front";
  if ("ou".includes(vowel)) return "round-back";
  return "round-front";
}

export function attachNewsSuffix(base: string, suffix: string) {
  const s = suffix.toLocaleLowerCase("tr-TR");
  const g = harmony(lastVowel(base));
  const nIn = g === "back" ? "nın" : g === "front" ? "nin" : g === "round-back" ? "nun" : "nün";
  const yA = g === "front" || g === "round-front" ? "ye" : "ya";
  const dA = g === "front" || g === "round-front" ? "de" : "da";
  const lAr = g === "front" || g === "round-front" ? "ler" : "lar";

  if (/^n[iıuü]n$/.test(s)) return `${base}'${nIn}`;
  if (/^[yiıuü]$/.test(s) || /^y[iıuü]$/.test(s)) return `${base}'${nIn.slice(1)}`;
  if (/^y[ae]$/.test(s) || /^[ae]$/.test(s)) return `${base}'${yA}`;
  if (/^[dt][ae]$/.test(s)) return `${base}'${dA}`;
  if (/^[dt][ae]n$/.test(s)) return `${base}'${dA}n`;
  if (/^l[ae]r$/.test(s)) return `${base}'${lAr}`;
  return `${base}'${s}`;
}

function tokenBefore(text: string, index: number) {
  const before = text.slice(0, index).replace(/[\s,;:]+$/u, "");
  const match = before.match(/([A-Za-zÇĞİÖŞÜçğıöşüÂâÎîÛû]+)['']?[a-zçğıöşü]*$/u);
  return match?.[1] ?? "";
}

function looksLikeName(token: string) {
  if (token.length < 2) return false;
  if (NAME_STOP.has(token.toLocaleLowerCase("tr-TR"))) return false;
  return LETTER.test(token[0]) && token[0] === token[0].toLocaleUpperCase("tr-TR");
}

function nearbyHit(text: string, start: number, end: number, words: string[]) {
  const window = text.slice(Math.max(0, start - 96), Math.min(text.length, end + 96)).toLocaleLowerCase("tr-TR");
  return words.some((word) => window.includes(word.toLocaleLowerCase("tr-TR")));
}

function shouldExpand(rule: AbbrRule, text: string, start: number, end: number) {
  if (rule.unlessNearby?.length && nearbyHit(text, start, end, rule.unlessNearby)) return false;
  const nameOk = rule.afterName ? looksLikeName(tokenBefore(text, start)) : false;
  const nearOk = rule.nearby?.length ? nearbyHit(text, start, end, rule.nearby) : false;
  if (rule.afterName && rule.nearby?.length) return nameOk || nearOk;
  if (rule.afterName) return nameOk;
  if (rule.nearby?.length) return nearOk;
  return true;
}

function rulePattern(from: string) {
  const body = escapeRe(from);
  const dotted = from.endsWith(".");
  const suffix = dotted ? "" : "(?:['']([A-Za-zçğıöşüÇĞİÖŞÜ]+))?";
  return new RegExp(`(?<!${LETTER.source})${body}${suffix}(?!${LETTER.source})`, "gu");
}

function disambiguateIha(text: string) {
  return text.replace(/(?<![A-Za-zÇĞİÖŞÜçğıöşü])İHA(?:['']([A-Za-zçğıöşüÇĞİÖŞÜ]+))?(?![A-Za-zÇĞİÖŞÜçğıöşü])/gu, (full, suffix: string | undefined, offset: number) => {
    const window = text.slice(Math.max(0, offset - 100), Math.min(text.length, offset + full.length + 100)).toLocaleLowerCase("tr-TR");
    const drone = /siha|drone|hava aracı|insansız|uçak|saldırı|keşif/.test(window);
    const agency = /muhabir|ajans|bildirdi|aktardı|duyurdu|haber merkezi|\(iha\)/.test(window);
    const base = drone && !agency ? "insansız hava aracı" : "İhlas Haber Ajansı";
    return suffix ? attachNewsSuffix(base, suffix) : base;
  });
}

export function expandNewsAbbreviations(text: string) {
  const rules = [...NEWS_ABBREVIATIONS].sort((a, b) => b.from.length - a.from.length);
  let out = text;
  for (const rule of rules) {
    const re = rulePattern(rule.from);
    out = out.replace(re, (full, g1: string | number, g2: string | number) => {
      const offset = typeof g1 === "number" ? g1 : (g2 as number);
      const suffix = typeof g1 === "string" ? g1 : undefined;
      const start = offset;
      if (!shouldExpand(rule, out, start, start + full.length)) return full;
      return suffix ? attachNewsSuffix(rule.to, suffix) : rule.to;
    });
  }
  out = disambiguateIha(out);
  return out;
}
