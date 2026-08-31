import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSettings();
  return {
    name: settings.siteName,
    short_name: settings.siteName.slice(0, 12),
    description: settings.siteSlogan,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: settings.brandColor,
    lang: "tr",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
