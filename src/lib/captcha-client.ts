export function turnstileSiteKey() {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
}

/** İstemci yalnızca public site key'i görür; widget bu anahtar varken gösterilir. */
export function captchaConfigured() {
  return Boolean(turnstileSiteKey());
}
