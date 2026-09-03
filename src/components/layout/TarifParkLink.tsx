const TARIFPARK_URL = "https://tarifpark.com/";
const TARIFPARK_RED = "#e92d28";

function UtensilsMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8" />
      <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7" />
      <path d="m2.1 21.8 6.4-6.3" />
      <path d="m19 5-7 7" />
    </svg>
  );
}

export function TarifParkLink({
  variant = "nav",
  onClick,
}: {
  variant?: "nav" | "menu" | "promo";
  onClick?: () => void;
}) {
  if (variant === "promo") {
    return (
      <a
        href={TARIFPARK_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-md border border-[#e92d28]/25 bg-[#fff5f4] px-3 py-3 text-sm font-semibold transition-colors hover:bg-[#ffe8e6]"
        style={{ color: TARIFPARK_RED }}
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white shadow-sm"
          style={{ background: TARIFPARK_RED }}
        >
          <UtensilsMark className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block font-extrabold leading-tight">TarifPark</span>
          <span className="mt-0.5 block text-[11px] font-medium text-[#a33a36]/80">
            Tarifleri keşfet
          </span>
        </span>
      </a>
    );
  }

  if (variant === "menu") {
    return (
      <a
        href={TARIFPARK_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-semibold hover:bg-surface"
        style={{ color: TARIFPARK_RED }}
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-md text-white shadow-sm"
          style={{ background: TARIFPARK_RED }}
        >
          <UtensilsMark className="h-4 w-4" />
        </span>
        TarifPark
      </a>
    );
  }

  return (
    <a
      href={TARIFPARK_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="TarifPark"
      title="TarifPark"
      className="inline-flex h-9 shrink-0 items-center gap-1.5 border border-[#e92d28]/25 bg-[#fff5f4] px-2 text-[11px] font-extrabold uppercase tracking-wide transition-colors hover:bg-[#ffe8e6] xl:px-2.5"
      style={{ color: TARIFPARK_RED }}
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center text-white"
        style={{ background: TARIFPARK_RED }}
      >
        <UtensilsMark className="h-3.5 w-3.5" />
      </span>
      <span className="hidden xl:inline">TarifPark</span>
    </a>
  );
}
