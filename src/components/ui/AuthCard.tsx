import { Container } from "@/components/ui/Container";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-10 sm:py-14">
      <div className="relative w-full max-w-md">
        <div
          className="pointer-events-none absolute -inset-4 rounded-2xl bg-brand/[0.04] blur-2xl"
          aria-hidden
        />
        <div className="relative overflow-hidden rounded-xl border border-border bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
          <div className="h-1 bg-brand" aria-hidden />
          <div className="border-b border-border/80 bg-gradient-to-r from-brand/[0.06] via-white to-white px-6 py-5 sm:px-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
            {subtitle ? (
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{subtitle}</p>
            ) : null}
          </div>
          <div className="px-6 py-6 sm:px-8 sm:py-7">{children}</div>
        </div>
      </div>
    </Container>
  );
}
