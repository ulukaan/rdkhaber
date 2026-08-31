import { AdUnit } from "@/components/ads/AdUnit";
import { sanitizeArticleHtml } from "@/lib/article-html";

export async function ArticleBody({ content }: { content: string }) {
  const clean = sanitizeArticleHtml(content);

  const paragraphs = clean.match(/<p[\s\S]*?<\/p>/gi) ?? [];
  const proseClass =
    "space-y-4 text-[17px] leading-relaxed text-ink [&_blockquote]:border-l-4 [&_blockquote]:border-brand [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-ink-soft [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-extrabold [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-bold [&_a]:text-brand [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5";

  if (paragraphs.length < 2) {
    return (
      <div>
        <div className={proseClass + " article-html"} dangerouslySetInnerHTML={{ __html: clean }} />
        <AdUnit code="1003" />
      </div>
    );
  }

  return (
    <div className={proseClass + " article-html"}>
      {paragraphs.map((html, i) => (
        <div key={i}>
          <div dangerouslySetInnerHTML={{ __html: html }} />
          {i === 1 ? <AdUnit code="1003" /> : null}
          {i > 1 && (i + 1) % 3 === 0 ? <AdUnit code="121" /> : null}
        </div>
      ))}
    </div>
  );
}
