import { AdUnit } from "@/components/ads/AdUnit";
import { sanitizeArticleHtml } from "@/lib/article-html";

const proseClass =
  "space-y-4 text-[17px] leading-relaxed text-ink [&_blockquote]:border-l-4 [&_blockquote]:border-brand [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-ink-soft [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-extrabold [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-bold [&_a]:text-brand [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded [&_figure]:my-4 [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-ink-soft";

/** Üst düzey içerik blokları — yalnızca &lt;p&gt; alınırsa gövde görselleri kaybolur. */
function splitArticleBlocks(html: string): string[] {
  const matches = html.match(
    /<(p|h2|h3|h4|blockquote|figure|ul|ol|table|pre)(\s[^>]*)?>[\s\S]*?<\/\1\s*>|<img\b[^>]*\/?>|<hr\s*\/?>/gi,
  );
  if (matches && matches.length > 0) return matches;
  const trimmed = html.trim();
  return trimmed ? [trimmed] : [];
}

export async function ArticleBody({ content }: { content: string }) {
  const clean = sanitizeArticleHtml(content);
  const blocks = splitArticleBlocks(clean);

  if (blocks.length < 2) {
    return (
      <div>
        <div className={proseClass + " article-html"} dangerouslySetInnerHTML={{ __html: clean }} />
        <AdUnit code="1003" />
      </div>
    );
  }

  return (
    <div className={proseClass + " article-html"}>
      {blocks.map((html, i) => (
        <div key={i}>
          <div dangerouslySetInnerHTML={{ __html: html }} />
          {i === 1 ? <AdUnit code="1003" /> : null}
          {i > 1 && (i + 1) % 3 === 0 ? <AdUnit code="121" /> : null}
        </div>
      ))}
    </div>
  );
}
