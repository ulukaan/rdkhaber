"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

// Sunucu ve istemci render zamanları farklı olacağından ("şimdi") tarih
// SSR'da gösterilmez, sadece mount sonrası istemcide doldurulur —
// böylece hydration uyuşmazlığı oluşmaz.
export function TodayDate() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Yalnızca istemcide, mount sonrası bir kez çalışır — SSR ile
    // eşleşmesi imkansız olan "şimdi" değerini kasıtlı olarak erteler.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
  }, []);

  if (!now) return <time className="font-medium tracking-wide" suppressHydrationWarning />;

  return (
    <time className="font-medium tracking-wide" dateTime={now.toISOString()}>
      {formatDate(now)}
    </time>
  );
}
