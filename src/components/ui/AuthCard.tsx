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
    <div className="flex flex-1 items-start justify-center px-5 py-10 sm:px-8 sm:py-14 lg:items-center">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <span className="mb-3 block h-1 w-10 bg-brand" aria-hidden />
          <h1 className="text-3xl font-black tracking-tight text-ink sm:text-[2rem]">{title}</h1>
          {subtitle ? (
            <p className="mt-2 max-w-[36ch] text-sm leading-relaxed text-ink-soft">{subtitle}</p>
          ) : null}
        </div>
        <div className="auth-form">{children}</div>
      </div>
    </div>
  );
}
