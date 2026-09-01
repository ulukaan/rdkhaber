const BOOKMARKS_KEY = "rdk_guest_bookmarks";
const MAX_GUEST_BOOKMARKS = 30;

export function readGuestBookmarkIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BOOKMARKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
}

export function writeGuestBookmarkIds(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(ids.slice(0, MAX_GUEST_BOOKMARKS)));
}

export function isGuestBookmarked(articleId: string) {
  return readGuestBookmarkIds().includes(articleId);
}

export function toggleGuestBookmark(articleId: string) {
  const current = readGuestBookmarkIds();
  if (current.includes(articleId)) {
    const next = current.filter((id) => id !== articleId);
    writeGuestBookmarkIds(next);
    return { saved: false, count: next.length };
  }
  const next = [articleId, ...current.filter((id) => id !== articleId)].slice(0, MAX_GUEST_BOOKMARKS);
  writeGuestBookmarkIds(next);
  return { saved: true, count: next.length };
}

export function clearGuestBookmarks() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(BOOKMARKS_KEY);
}
