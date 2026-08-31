"use client";

import { useEffect } from "react";
import { recordArticleReadAction } from "@/actions/library";

export function RecordArticleRead({ articleId }: { articleId: string }) {
  useEffect(() => {
    recordArticleReadAction(articleId).catch(() => {});
  }, [articleId]);
  return null;
}
