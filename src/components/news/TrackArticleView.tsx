"use client";

import { useEffect, useRef } from "react";

/** Haberi yalnızca gerçek tarayıcı ziyaretinde sayar (bot/çift yenileme korumalı API). */
export function TrackArticleView({ articleId }: { articleId: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current || !articleId) return;
    sent.current = true;
    void fetch("/api/haberler/goruntuleme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId }),
      keepalive: true,
    }).catch(() => {});
  }, [articleId]);

  return null;
}
