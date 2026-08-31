import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p", "h2", "h3", "h4", "blockquote",
  "strong", "b", "em", "i", "ul", "ol", "li", "a", "br",
  "img", "figure", "figcaption",
];

export function sanitizeArticleHtml(content: string) {
  return sanitizeHtml(content, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      a: ["http", "https", "mailto"],
      img: ["http", "https"],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });
}
