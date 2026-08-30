import { getSiteUrl } from "@/lib/site-url";
import { getSettings } from "@/lib/settings";

export function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function absoluteAssetUrl(path: string | undefined, siteUrl: string) {
  if (!path?.trim()) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export type EmailBranding = {
  siteName: string;
  brandColor: string;
  logoUrl?: string;
  siteUrl: string;
  contactEmail: string;
  siteSlogan: string;
};

export async function getEmailBranding(): Promise<EmailBranding> {
  const settings = await getSettings();
  const siteUrl = getSiteUrl();
  return {
    siteName: settings.siteName,
    brandColor: settings.brandColor || "#d0021b",
    logoUrl: absoluteAssetUrl(settings.logoUrl, siteUrl),
    siteUrl,
    contactEmail: settings.contactEmail,
    siteSlogan: settings.siteSlogan,
  };
}

export type CorporateEmailOptions = EmailBranding & {
  preheader?: string;
  eyebrow?: string;
  title?: string;
  contentHtml: string;
  cta?: { label: string; href: string };
  footerNote?: string;
};

function emailButton(href: string, label: string, brandColor: string) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
  <tr>
    <td align="center" style="border-radius:2px;background:${brandColor};">
      <a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"
        style="display:inline-block;padding:14px 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;line-height:1.2;">
        ${escapeHtml(label)}
      </a>
    </td>
  </tr>
</table>`;
}

function emailHeader(branding: EmailBranding) {
  const logo = branding.logoUrl
    ? `<img src="${escapeHtml(branding.logoUrl)}" alt="${escapeHtml(branding.siteName)}" width="160" height="40" style="display:block;max-width:160px;height:auto;border:0;" />`
    : `<span style="font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:900;color:#14181f;letter-spacing:-0.02em;">${escapeHtml(branding.siteName)}</span>`;

  const slogan = branding.siteSlogan
    ? `<p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#6b7280;">${escapeHtml(branding.siteSlogan)}</p>`
    : "";

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
  <tr>
    <td style="padding:28px 36px 24px;border-bottom:1px solid #e8eaed;">
      <a href="${escapeHtml(branding.siteUrl)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
        ${logo}
      </a>
      ${slogan}
    </td>
  </tr>
</table>`;
}

function emailFooter(branding: EmailBranding, footerNote?: string) {
  const year = new Date().getFullYear();
  const note = footerNote
    ? `<p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:#9ca3af;">${footerNote}</p>`
    : "";

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
  <tr>
    <td style="padding:24px 36px;background:#f8f9fb;border-top:1px solid #e8eaed;">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:#14181f;">
        ${escapeHtml(branding.siteName)}
      </p>
      <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#6b7280;">
        <a href="${escapeHtml(branding.siteUrl)}" style="color:${branding.brandColor};text-decoration:none;font-weight:600;">${escapeHtml(branding.siteUrl.replace(/^https?:\/\//, ""))}</a>
        ·
        <a href="mailto:${escapeHtml(branding.contactEmail)}" style="color:${branding.brandColor};text-decoration:none;">${escapeHtml(branding.contactEmail)}</a>
      </p>
      <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9ca3af;">
        © ${year} ${escapeHtml(branding.siteName)}. Tüm hakları saklıdır.
      </p>
      ${note}
    </td>
  </tr>
</table>`;
}

/** Kurumsal giden e-posta iskeleti — bülten, bildirim, şifre sıfırlama vb. */
export function wrapCorporateEmailHtml({
  preheader,
  eyebrow,
  title,
  contentHtml,
  cta,
  footerNote,
  ...branding
}: CorporateEmailOptions) {
  const preview = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(preheader)}&#847;&zwnj;&nbsp;</div>`
    : "";

  const eyebrowHtml = eyebrow
    ? `<p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:0.14em;text-transform:uppercase;color:${branding.brandColor};">${escapeHtml(eyebrow)}</p>`
    : "";

  const titleHtml = title
    ? `<h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.25;font-weight:900;color:#14181f;">${escapeHtml(title)}</h1>`
    : "";

  const headingBlock =
    eyebrowHtml || titleHtml
      ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
  <tr>
    <td style="padding:32px 36px 0;">
      ${eyebrowHtml}
      ${titleHtml}
    </td>
  </tr>
</table>`
      : "";

  const ctaBlock = cta
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
  <tr>
    <td align="center" style="padding:8px 36px 36px;">
      ${emailButton(cta.href, cta.label, branding.brandColor)}
      <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#9ca3af;word-break:break-all;">
        Buton çalışmıyorsa: <a href="${escapeHtml(cta.href)}" style="color:${branding.brandColor};">${escapeHtml(cta.href)}</a>
      </p>
    </td>
  </tr>
</table>`
    : "";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(title || branding.siteName)}</title>
</head>
<body style="margin:0;padding:0;background:#eef0f4;font-family:Arial,Helvetica,sans-serif;color:#14181f;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
${preview}
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef0f4;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e0e3e8;box-shadow:0 4px 24px rgba(20,24,31,0.06);">
        <tr>
          <td style="height:4px;background:${branding.brandColor};font-size:0;line-height:0;">&nbsp;</td>
        </tr>
        <tr>
          <td>${emailHeader(branding)}</td>
        </tr>
        ${headingBlock}
        <tr>
          <td style="padding:20px 36px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#374151;">
            ${contentHtml}
          </td>
        </tr>
        ${ctaBlock}
        <tr>
          <td>${emailFooter(branding, footerNote)}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export type NotificationField = {
  label: string;
  value: string;
  multiline?: boolean;
};

/** Panel bildirimleri — iletişim, ihbar, haber başvurusu */
export function buildNotificationFieldsHtml(fields: NotificationField[]) {
  const rows = fields
    .filter((f) => f.value.trim())
    .map((field) => {
      const value = field.multiline
        ? `<div style="margin-top:4px;white-space:pre-wrap;">${escapeHtml(field.value)}</div>`
        : escapeHtml(field.value);
      return `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eef0f4;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:#6b7280;width:120px;vertical-align:top;">${escapeHtml(field.label)}</td>
        <td style="padding:10px 0 10px 16px;border-bottom:1px solid #eef0f4;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:#14181f;vertical-align:top;">${value}</td>
      </tr>`;
    })
    .join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;border-collapse:collapse;">${rows}</table>`;
}

export function buildNotificationEmailHtml(
  branding: EmailBranding,
  {
    eyebrow,
    title,
    intro,
    fields,
    preheader,
    panelHref,
  }: {
    eyebrow: string;
    title: string;
    intro: string;
    fields: NotificationField[];
    preheader?: string;
    panelHref?: string;
  },
) {
  return wrapCorporateEmailHtml({
    ...branding,
    preheader: preheader ?? title,
    eyebrow,
    title,
    contentHtml: `<p style="margin:0 0 16px;">${escapeHtml(intro)}</p>${buildNotificationFieldsHtml(fields)}`,
    cta: panelHref ? { label: "Panelde görüntüle", href: panelHref } : undefined,
    footerNote: "Bu mesaj site formu üzerinden otomatik gönderilmiştir.",
  });
}

export function htmlToPlainText(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
