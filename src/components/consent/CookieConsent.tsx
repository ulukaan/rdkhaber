"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CITY_COOKIE } from "@/lib/cities";
import {
  acceptAllConsent,
  readConsentCookie,
  rejectOptionalConsent,
  writeConsentCookie,
  CONSENT_EVENT,
  CONSENT_OPEN_EVENT,
  type ConsentState,
} from "@/lib/cookie-consent";
import { cn } from "@/lib/utils";
import { ConsentScripts } from "@/components/consent/ConsentScripts";

type Props = {
  analyticsConfigured: boolean;
  adsConfigured: boolean;
  gaId: string;
  gtmId: string;
  adsenseClient: string;
  adsenseAuto: boolean;
  customBodyEndHtml: string;
};

export function CookieConsent(props: Props) {
  const pathname = usePathname();
  const panel = pathname.startsWith("/admin") || pathname.startsWith("/editor");
  const [ready, setReady] = useState(() => typeof window !== "undefined");
  const [consent, setConsent] = useState<ConsentState | null>(() =>
    typeof window !== "undefined" ? readConsentCookie() : null,
  );
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [draft, setDraft] = useState<ConsentState>(() =>
    typeof window !== "undefined" ? readConsentCookie() ?? rejectOptionalConsent() : rejectOptionalConsent(),
  );

  useEffect(() => {
    queueMicrotask(() => {
      const current = readConsentCookie();
      setConsent(current);
      if (current) setDraft(current);
      setReady(true);
      setOpen(!current && !panel);
    });

    const onChange = (event: Event) => {
      const next = (event as CustomEvent<ConsentState>).detail;
      setConsent(next);
      setDraft(next);
    };
    const onOpen = () => {
      if (panel) return;
      setDraft(readConsentCookie() ?? rejectOptionalConsent());
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener(CONSENT_EVENT, onChange);
      window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
    };
  }, [panel]);

  const save = (state: ConsentState) => {
    writeConsentCookie(state);
    if (!state.preferences) {
      document.cookie = `${CITY_COOKIE}=;path=/;max-age=0;samesite=lax`;
    }
    setConsent(state);
    setOpen(false);
  };

  return (
    <>
      <ConsentScripts
        consent={consent}
        gaId={props.gaId}
        gtmId={props.gtmId}
        adsenseClient={props.adsenseClient}
        adsenseAuto={props.adsenseAuto}
        customBodyEndHtml={props.customBodyEndHtml}
      />

      {ready && open && !panel ? (
        <div
          className="fixed inset-x-0 bottom-0 z-[70] p-3 sm:p-5"
          role="dialog"
          aria-labelledby="cookie-consent-title"
          aria-modal="true"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
            <div className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 id="cookie-consent-title" className="text-base font-extrabold text-ink">
                  Çerez ve gizlilik
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  Sitenin çalışması için zorunlu çerezler kullanılır. Analiz ve reklam çerezleri
                  yalnızca sizin onayınızla yüklenir. Ayrıntılar aşağıda ve{" "}
                  <Link href="/cerezler" className="font-semibold text-brand hover:underline">
                    Çerez Aydınlatması
                  </Link>{" "}
                  sayfasındadır.
                </p>
              </div>
            </div>

            <div className="px-4 py-3 sm:px-5">
              <p className="text-sm leading-relaxed text-ink">
                {props.analyticsConfigured
                  ? "Google Analytics / Tag Manager tanımlı; onaylarsanız ziyaret istatistiği Google’a gider."
                  : "Google Analytics şu an kapalı — panelde kimlik girilmediği için ölçüm script’i yüklenmez."}{" "}
                {props.adsConfigured
                  ? "Google AdSense tanımlı; reklam onayı kişiselleştirilmiş reklam çerezlerini açar."
                  : "Google AdSense şu an kapalı. Sitedeki reklamlar kendi sunucumuzdaki görsellerdir, Google’a ziyaretçi profili gönderilmez."}
              </p>

              <button
                type="button"
                onClick={() => setDetails((v) => !v)}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-ink hover:text-brand"
                aria-expanded={details}
              >
                <ChevronDown className={cn("h-4 w-4 transition-transform", details && "rotate-180")} />
                Ayrıntılı bilgi ve tercihler
              </button>

              {details ? (
                <div className="mt-3 grid gap-2">
                  <Category
                    title="Zorunlu"
                    locked
                    checked
                    body="Oturum, güvenlik ve form koruması. Site bunlarsız çalışmaz. Giriş yaptığınızda Auth.js çerezleri, formlarda CSRF koruması kullanılır."
                  />
                  <Category
                    title="Tercihler"
                    checked={draft.preferences}
                    onChange={(value) => setDraft((s) => ({ ...s, preferences: value }))}
                    body="Seçtiğiniz ili (hava durumu / namaz vakti) hatırlamak için rdk_city çerezi. Reddederseniz tercih tarayıcı kapanınca unutulur."
                  />
                  <Category
                    title="Analiz"
                    checked={draft.analytics}
                    onChange={(value) => setDraft((s) => ({ ...s, analytics: value }))}
                    body={
                      props.analyticsConfigured
                        ? "Google Analytics / Tag Manager: sayfa görüntüleme, cihaz ve yaklaşık konum. IP Google tarafında işlenebilir."
                        : "Şu an aktif değil. Onay verseğiniz bile panelde GA/GTM kimliği yoksa script yüklenmez."
                    }
                  />
                  <Category
                    title="Reklam"
                    checked={draft.ads}
                    onChange={(value) => setDraft((s) => ({ ...s, ads: value }))}
                    body={
                      props.adsConfigured
                        ? "Google AdSense çerezleri ilgi alanına göre reklam gösterebilir."
                        : "Google reklam ağı kapalı. Kendi reklamlarımız yalnızca tıklanınca reklamverenin sitesine götürür; gizli izleme çerezi yazılmaz."
                    }
                  />
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 border-t border-border bg-surface/70 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
              <Button type="button" variant="ghost" size="sm" onClick={() => save(rejectOptionalConsent())}>
                Yalnızca zorunlular
              </Button>
              {details ? (
                <Button type="button" variant="outline" size="sm" onClick={() => save({ ...draft, necessary: true, v: 1 })}>
                  Seçimi kaydet
                </Button>
              ) : null}
              <Button type="button" size="sm" onClick={() => save(acceptAllConsent())}>
                Tümünü kabul et
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Category({
  title,
  body,
  checked,
  locked,
  onChange,
}: {
  title: string;
  body: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface/50 p-3">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-border accent-[var(--brand)]"
        checked={checked}
        disabled={locked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className="min-w-0">
        <span className="block text-sm font-bold text-ink">
          {title}
          {locked ? <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">Zorunlu</span> : null}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">{body}</span>
      </span>
    </label>
  );
}
