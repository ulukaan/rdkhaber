export type WordPair = {
  find: string;
  replace: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchCase(source: string, replacement: string) {
  if (!source || !replacement) return replacement;
  const upper = source.toLocaleUpperCase("tr-TR");
  const lower = source.toLocaleLowerCase("tr-TR");
  // AA / IHA gibi kısa kısaltmalarda karşılığı olduğu gibi bırak
  if (source === upper && source !== lower && source.length <= 4) {
    return replacement;
  }
  if (source === upper && source !== lower) {
    return replacement.toLocaleUpperCase("tr-TR");
  }
  const first = source.charAt(0);
  if (first === first.toLocaleUpperCase("tr-TR") && first !== first.toLocaleLowerCase("tr-TR")) {
    return (
      replacement.charAt(0).toLocaleUpperCase("tr-TR") + replacement.slice(1)
    );
  }
  return replacement;
}

function replacePlainOnce(
  text: string,
  find: string,
  replace: string,
  placeholders: string[],
) {
  if (!find || !text) return text;
  const re = new RegExp(`(?<!\\p{L})${escapeRegExp(find)}(?!\\p{L})`, "giu");
  return text.replace(re, (matched) => {
    const idx = placeholders.length;
    placeholders.push(matchCase(matched, replace));
    return `\uE000${idx}\uE001`;
  });
}

/** HTML etiketlerinin içine dokunmadan metin düğümlerinde değiştirir. */
export function replaceInHtml(html: string, pairs: WordPair[]) {
  if (!html || pairs.length === 0) return html;
  return html.replace(/(<[^>]+>)|([^<]+)/g, (chunk, tag: string | undefined, text: string | undefined) => {
    if (tag) return tag;
    return applyWordPairs(text ?? "", pairs);
  });
}

/**
 * Kelimeleri değiştirir. Yer tutucu kullanarak ters eşleşmelerin
 * (sorun↔problem) birbirini bozmasını engeller.
 */
export function applyWordPairs(text: string, pairs: WordPair[]) {
  if (!text || pairs.length === 0) return text;
  const ordered = [...pairs]
    .filter((p) => p.find.trim())
    .sort((a, b) => b.find.length - a.find.length || a.find.localeCompare(b.find, "tr"));
  const placeholders: string[] = [];
  const result = ordered.reduce(
    (acc, pair) => replacePlainOnce(acc, pair.find.trim(), pair.replace, placeholders),
    text,
  );
  return result.replace(/\uE000(\d+)\uE001/g, (_, i) => placeholders[Number(i)] ?? "");
}

/**
 * Kalıp satırlarını çözer.
 * Örnekler: `abartı => mübalağa` · `abartı | mübalağa` · `abartı yerine mübalağa`
 */
export function parseWordTemplate(raw: string): WordPair[] {
  const seen = new Set<string>();
  const pairs: WordPair[] = [];

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    let find = "";
    let replace = "";

    const arrow = trimmed.split(/\s*(?:=>|->)\s*/);
    if (arrow.length >= 2) {
      find = arrow[0].trim();
      replace = arrow.slice(1).join(" ").trim();
    } else {
      const tab = trimmed.split(/\t+/);
      if (tab.length >= 2 && tab[0].trim()) {
        find = tab[0].trim();
        replace = tab[1].trim();
      } else {
        const pipe = trimmed.split(/\s*[|;]\s*/);
        if (pipe.length >= 2) {
          find = pipe[0].trim();
          replace = pipe.slice(1).join(" ").trim();
        } else {
          const yerine = trimmed.match(/^(.+?)\s+yerine\s+(.+)$/i);
          if (yerine) {
            find = yerine[1].trim();
            replace = yerine[2].trim();
          }
        }
      }
    }

    if (!find) continue;
    const key = find.toLocaleLowerCase("tr-TR");
    if (seen.has(key)) continue;
    seen.add(key);
    pairs.push({ find, replace });
  }

  return pairs;
}
