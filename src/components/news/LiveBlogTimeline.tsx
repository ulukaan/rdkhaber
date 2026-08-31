import { formatDate } from "@/lib/utils";

type Update = {
  id: string;
  title: string | null;
  body: string;
  pinned: boolean;
  createdAt: Date | string;
  user: { name: string };
};

export function LiveBlogTimeline({ updates }: { updates: Update[] }) {
  if (updates.length === 0) return null;

  return (
    <section className="my-8 border border-border bg-surface/50 p-4 sm:p-5" aria-label="Canlı anlatım">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-brand">
        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-brand" aria-hidden />
        Canlı anlatım
      </h2>
      <ol className="relative space-y-4 border-l-2 border-brand/30 pl-4">
        {updates.map((u) => (
          <li key={u.id} className="relative">
            <span
              className="absolute -left-[1.35rem] top-1.5 h-2.5 w-2.5 rounded-full bg-brand"
              aria-hidden
            />
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
              {formatDate(u.createdAt)} · {u.user.name}
            </p>
            {u.title ? <p className="mt-1 font-bold text-ink">{u.title}</p> : null}
            <div
              className="prose prose-sm mt-1 max-w-none text-ink-soft"
              dangerouslySetInnerHTML={{ __html: u.body }}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
