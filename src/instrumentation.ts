/** Sentry — yalnızca SENTRY_DSN tanımlıysa etkinleşir (@sentry/node). */
export async function register() {
  const dsn = process.env.SENTRY_DSN?.trim();
  if (!dsn) return;

  const Sentry = await import("@sentry/node");
  Sentry.init({
    dsn,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
    environment: process.env.NODE_ENV,
  });
}
