/** Tam paylaşım URL'si — istemcide origin ile birleştirir. */
export function resolveShareUrl(url: string): string {
  if (url.startsWith("http")) return url;
  if (typeof window === "undefined") return url;
  return `${window.location.origin}${url.startsWith("/") ? url : `/${url}`}`;
}
