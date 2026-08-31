import { getSettings } from "@/lib/settings";
import { buildAdsTxtContent } from "@/lib/ads-txt";

/** Google AdSense ads.txt — yayıncı doğrulaması için. */
export async function GET() {
  const settings = await getSettings();
  const body = buildAdsTxtContent(settings.googleAdsenseClient);

  return new Response(body || "# ads.txt: AdSense yayıncı kimliği tanımlı değil\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
