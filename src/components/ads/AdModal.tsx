"use client";

import { useState } from "react";

export function AdModal({
  imageUrl,
  targetUrl,
  name,
}: {
  imageUrl: string;
  targetUrl: string;
  name: string;
}) {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    const key = "rd-ad-modal-077";
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, "1");
    return true;
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Açılış reklamı"
    >
      <div className="relative max-w-[336px] bg-white p-3 shadow-lg">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-bold text-white"
          aria-label="Kapat"
        >
          ×
        </button>
        <a href={targetUrl} target="_blank" rel="noopener noreferrer sponsored">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={name} width={336} height={280} className="h-auto w-full" />
        </a>
      </div>
    </div>
  );
}
