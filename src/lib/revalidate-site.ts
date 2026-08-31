import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

/** Ana sayfa ve site önbelleğini temizle (haber, kategori, ayar, menü güncellemelerinde). */
export function revalidatePublicSite(opts?: { layout?: boolean }) {
  revalidatePath("/");
  if (opts?.layout) {
    revalidatePath("/", "layout");
  }
  updateTag(CACHE_TAGS.settings);
  updateTag(CACHE_TAGS.categories);
  updateTag(CACHE_TAGS.breaking);
  updateTag(CACHE_TAGS.ads);
  updateTag(CACHE_TAGS.nav);
}
