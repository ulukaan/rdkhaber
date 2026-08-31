"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CITIES, CITY_COOKIE } from "@/lib/cities";
import { readConsentCookie } from "@/lib/cookie-consent";

export function CitySelect({ value }: { value: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <label className="inline-flex shrink-0 items-center gap-1 border-l border-border pl-3">
      <span className="sr-only">İl seçin</span>
      <select
        value={value}
        disabled={pending}
        aria-label="İl seçimi"
        onChange={(e) => {
          const slug = e.target.value;
          const consent = readConsentCookie();
          const persist = consent?.preferences === true;
          document.cookie = persist
            ? `${CITY_COOKIE}=${encodeURIComponent(slug)};path=/;max-age=31536000;samesite=lax`
            : `${CITY_COOKIE}=${encodeURIComponent(slug)};path=/;samesite=lax`;
          start(() => router.refresh());
        }}
        className="w-[4.75rem] cursor-pointer appearance-none truncate border-0 bg-transparent py-0 pr-3.5 text-[11px] font-bold text-ink outline-none disabled:opacity-60"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%234b5563' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0 center",
        }}
      >
        {CITIES.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
