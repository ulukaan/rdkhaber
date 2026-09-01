<<<<<<< HEAD
/** Cloudflare Turnstile doğrulaması — anahtarlar tanımlı değilse captcha atlanır. */
=======
/** Cloudflare Turnstile doğrulaması — prod'da anahtar yoksa reddedilir. */
>>>>>>> origin/main
export async function verifyTurnstileToken(token: string, remoteIp?: string) {
  if (!captchaConfigured()) {
    return process.env.NODE_ENV !== "production";
  }

  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret || !token?.trim()) return false;

  const body = new URLSearchParams({
    secret,
    response: token.trim(),
  });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const json = (await res.json()) as { success?: boolean };
    return Boolean(json.success);
  } catch {
    return false;
  }
}

export function turnstileSiteKey() {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
}

export function captchaConfigured() {
  return Boolean(turnstileSiteKey() && process.env.TURNSTILE_SECRET_KEY?.trim());
}

<<<<<<< HEAD
/** Captcha zorunlu mu? (yalnızca anahtarlar tanımlıysa) */
export function captchaRequired() {
  return captchaConfigured();
=======
/** Prod'da captcha zorunlu mu? */
export function captchaRequired() {
  return process.env.NODE_ENV === "production";
>>>>>>> origin/main
}
