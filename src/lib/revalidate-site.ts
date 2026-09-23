import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

/** Ana sayfa ve site önbelleğini temizle (haber, kategori, ayar, menü güncellemelerinde). */
export function revalidatePublicSite(opts?: { layout?: boolean }) {
  revalidatePath("/");
  if (opts?.layout) {
    revalidatePath("/", "layout");
  }
  for (const tag of [
    CACHE_TAGS.settings,
    CACHE_TAGS.categories,
    CACHE_TAGS.breaking,
    CACHE_TAGS.ads,
    CACHE_TAGS.nav,
  ]) {
    // Route Handler + Server Action ortak: updateTag sadece action içinde geçerli
    revalidateTag(tag, { expire: 0 });
  }
}
