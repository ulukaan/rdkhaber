import sanitizeHtml from "sanitize-html";

const HEAD_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["meta", "link"],
  allowedAttributes: {
    meta: ["name", "content", "property", "charset", "http-equiv"],
    link: ["rel", "href", "type", "crossorigin", "crossOrigin", "sizes"],
  },
  allowedSchemes: ["http", "https"],
  allowedSchemesByTag: {
    link: ["http", "https"],
  },
  disallowedTagsMode: "discard",
};

/** Yalnızca meta/link etiketleri — script ve iframe engellenir. */
export function sanitizeCustomHeadHtml(html: string) {
  return sanitizeHtml(html.trim(), HEAD_OPTIONS);
}

const BODY_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["img", "noscript"],
  allowedAttributes: {
    img: ["src", "alt", "width", "height"],
  },
  allowedSchemes: ["https"],
  allowedSchemesByTag: {
    img: ["https"],
  },
  disallowedTagsMode: "discard",
};

/** Sayfa sonu: script/iframe yok; yalnızca https img piksel (opsiyonel). */
export function sanitizeCustomBodyEndHtml(html: string) {
  const cleaned = sanitizeHtml(html.trim(), BODY_OPTIONS);
  if (/<script|javascript:|on\w+\s*=|<iframe|<object|<embed/i.test(cleaned)) {
    return "";
  }
  return cleaned;
}

export type ParsedMetaTag = {
  name?: string;
  property?: string;
  content?: string;
  httpEquiv?: string;
  charSet?: string;
};

/** Layout <head> içine güvenli meta etiketleri çıkarır. */
export function parseCustomMetaTags(html: string): ParsedMetaTag[] {
  const safe = sanitizeCustomHeadHtml(html);
  const tags: ParsedMetaTag[] = [];
  const re = /<meta\b([^>]*)\/?>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(safe)) !== null) {
    const attrs = match[1] ?? "";
    const read = (key: string) => {
      const m = attrs.match(new RegExp(`${key}\\s*=\\s*["']([^"']+)["']`, "i"));
      return m?.[1]?.trim();
    };
    const tag: ParsedMetaTag = {
      name: read("name"),
      property: read("property"),
      content: read("content"),
      httpEquiv: read("http-equiv"),
      charSet: read("charset"),
    };
    if (tag.name || tag.property || tag.httpEquiv || tag.charSet) {
      tags.push(tag);
    }
  }
  return tags;
}

export function parseCustomLinkTags(html: string) {
  const safe = sanitizeCustomHeadHtml(html);
  const tags: Array<{ rel: string; href: string; type?: string }> = [];
  const re = /<link\b([^>]*)\/?>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(safe)) !== null) {
    const attrs = match[1] ?? "";
    const read = (key: string) => {
      const m = attrs.match(new RegExp(`${key}\\s*=\\s*["']([^"']+)["']`, "i"));
      return m?.[1]?.trim();
    };
    const rel = read("rel");
    const href = read("href");
    if (rel && href && /^https?:\/\//i.test(href)) {
      tags.push({ rel, href, type: read("type") });
    }
  }
  return tags;
}
