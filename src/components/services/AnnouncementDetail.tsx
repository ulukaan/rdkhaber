import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import type { MunicipalityAnnouncementDetail } from "@/lib/municipality-announcements";
import { Button } from "@/components/ui/Button";

export function AnnouncementDetailView({ detail }: { detail: MunicipalityAnnouncementDetail }) {
  return (
    <article className="flex flex-col gap-6">
      <div>
        <Link
          href="/duyurular"
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-brand hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Tüm duyurular
        </Link>
      </div>

      <header className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-brand">Duyuru</p>
        <h1 className="mt-2 text-2xl font-extrabold text-ink md:text-3xl">{detail.title}</h1>
        {detail.publishedLabel ? (
          <p className="mt-3 text-sm text-ink-soft">{detail.publishedLabel}</p>
        ) : null}
      </header>

      {detail.html ? (
        <div
          className="article-html space-y-4 rounded-2xl border border-border bg-white p-5 text-[17px] leading-relaxed text-ink shadow-sm [&_a]:text-brand [&_a]:underline [&_img]:max-w-full [&_img]:rounded-xl"
          dangerouslySetInnerHTML={{ __html: detail.html }}
        />
      ) : null}

      {detail.attachments.length > 0 ? (
        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Ek dosyalar</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {detail.attachments.map((file) => (
              <li key={file.href}>
                <Button href={file.href} variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">{file.name}</span>
                  {file.size ? <span className="text-ink-soft">({file.size})</span> : null}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
