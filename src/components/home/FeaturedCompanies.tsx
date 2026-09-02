import { MoreHorizontal } from "lucide-react";
import type { FeaturedCompany } from "@/lib/companies";

const NAVY = "#0a2f5c";

export function FeaturedCompanies({ items }: { items: FeaturedCompany[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border border-border bg-white" aria-label="Vitrindeki firmalar">
      <div className="flex items-center gap-3 px-4 pt-4">
        <h2 className="shrink-0 text-base font-extrabold tracking-tight" style={{ color: NAVY }}>
          Vitrindeki Firmalar
        </h2>
        <span className="h-px min-w-0 flex-1" style={{ backgroundColor: NAVY }} aria-hidden />
        <span className="shrink-0 text-ink-soft" aria-hidden>
          <MoreHorizontal className="h-5 w-5" style={{ color: NAVY }} />
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-4 px-4 py-4 sm:grid-cols-3 md:grid-cols-4">
        {items.map((company) => {
          const inner = (
            <>
              <span className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden border border-border bg-white p-3 transition-shadow group-hover:shadow-sm">
                {company.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.logoUrl}
                    alt={`${company.name} logosu`}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-xs font-bold text-ink-soft">{company.name}</span>
                )}
              </span>
              <span className="mt-2 block text-center text-sm font-semibold text-ink">
                {company.name}
              </span>
              {company.category ? (
                <span className="mt-0.5 block text-center text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                  {company.category}
                </span>
              ) : null}
            </>
          );

          return (
            <li key={company.id}>
              {company.websiteUrl ? (
                <a
                  href={company.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="group block"
                >
                  {inner}
                </a>
              ) : (
                <div className="group block">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
