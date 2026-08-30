import { getSettings } from "@/lib/settings";

/** Google AdSense ads.txt — yayıncı doğrulaması için. */
export async function GET() {
  const settings = await getSettings();
  const client = settings.googleAdsenseClient.trim().toLowerCase();
  const pub = client.replace(/^ca-pub-/, "");

  const lines = [
    "# ads.txt — Düzce Radikal",
    pub
      ? `google.com, pub-${pub}, DIRECT, f08c47fec0942fa0`
      : "# AdSense yayıncı kimliği henüz tanımlı değil (Görünüm → Google Site Kit).",
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
