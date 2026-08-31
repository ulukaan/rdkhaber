export function turnstileSiteKey() {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
}

export function captchaConfigured() {
  return Boolean(turnstileSiteKey());
}
