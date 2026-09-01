"use client";

import { computeBoxPct } from "@/lib/election";
import type { ElectionDistrictView } from "@/components/election/ElectionDistrictGrid";

export function ElectionDistrictSelect({
  districts,
  value,
  onChange,
}: {
  districts: ElectionDistrictView[];
  value: string;
  onChange: (slug: string) => void;
}) {
  if (districts.length === 0) return null;

  return (
    <label className="inline-flex min-w-0 shrink items-center gap-1 border-l border-border pl-3">
      <span className="sr-only">İlçe seçin</span>
      <select
        value={value}
        aria-label="İlçe seçimi"
        onChange={(e) => {
          if (e.target.value) onChange(e.target.value);
        }}
        className="max-w-[9rem] cursor-pointer appearance-none truncate border-0 bg-transparent py-0 pr-3.5 text-[11px] font-bold text-ink outline-none sm:max-w-[11rem]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%234b5563' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0 center",
        }}
      >
        <option value="" disabled>
          İlçe seçin
        </option>
        {districts.map((district) => {
          const boxPct = computeBoxPct(district.openBoxes, district.totalBoxes);
          const leader = district.leadingName
            ? ` — ${district.leadingName}${district.leadingPct != null ? ` %${district.leadingPct.toFixed(1)}` : ""}`
            : "";
          return (
            <option key={district.id} value={district.slug}>
              {district.name}
              {leader}
              {` · %${boxPct.toFixed(0)} sandık`}
            </option>
          );
        })}
      </select>
    </label>
  );
}
