"use client";

import { useEffect } from "react";
import { mergeGuestBookmarksAction } from "@/actions/library";
import { clearGuestBookmarks, readGuestBookmarkIds } from "@/lib/guest-library";

/** Sayfa yüklendiğinde misafir kayıtlarını (varsa) giriş yapmış hesaba aktarır. */
export function GuestLibrarySync() {
  useEffect(() => {
    const ids = readGuestBookmarkIds();
    if (ids.length === 0) return;

    mergeGuestBookmarksAction(ids)
      .then((result) => {
        if (result && "merged" in result && result.merged > 0) {
          clearGuestBookmarks();
        }
      })
      .catch(() => {});
  }, []);

  return null;
}
