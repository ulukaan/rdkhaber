import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { StaticPageHeader } from "@/components/pages/StaticDocument";
import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Çerez Aydınlatması",
  description: "Hangi verilerin toplandığı, hangi çerezlerin kullanıldığı ve onay seçenekleri.",
};

export default async function CookiePolicyPage() {
  const settings = await getSettings();
  const analyticsOn = Boolean(settings.googleAnalyticsId.trim() || settings.googleTagManagerId.trim());
  const adsOn = settings.googleAdsenseClient.trim() !== "" && settings.googleAdsenseAutoAds === "1";

  return (
    <>
      <StaticPageHeader
        title="Çerez ve veri aydınlatması"
        eyebrow="KVKK"
        description="Bu sayfa kodla birlikte güncellenir. Sitede gerçekten ne çalıştığı burada yazılır; genel ifadelerle gizlenmez."
      />
      <Container className="py-8 sm:py-10">
        <div className="mx-auto max-w-3xl space-y-8 text-[15px] leading-7 text-ink/85">
          <section>
            <h2 className="text-lg font-extrabold text-ink">Şu an ne oluyor?</h2>
            <ul className="mt-3 space-y-2">
              <li>
                <strong>Google Analytics / Tag Manager:</strong>{" "}
                {analyticsOn ? "Panelde kimlik tanımlı. Onaylarsanız ölçüm script’i yüklenir." : "Kapalı. Canlı sitede gtag / GTM script’i yok."}
              </li>
              <li>
                <strong>Google AdSense:</strong>{" "}
                {adsOn ? "Açık. Reklam onayıyla Google reklam çerezleri yüklenebilir." : "Kapalı. Reklamlar kendi sunucumuzdaki görsellerdir."}
              </li>
              <li>
                <strong>Kendi veritabanımız:</strong> Üyelik, yorum, form, bülten ve haber okunma sayacı tutulur. Bunlar çerez onayı değil, verdiğiniz bilgi veya sitenin işleyişidir.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-ink">Zorunlu çerezler</h2>
            <p className="mt-2">
              Giriş oturumu (__Host-authjs / Auth.js), güvenlik ve form koruması. Reddedilemez; site aksi halde
              çalışmaz. Bu çerezler reklam veya analitik için kullanılmaz.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-ink">Tercih çerezi</h2>
            <p className="mt-2">
              <code className="rounded bg-surface px-1.5 py-0.5 text-sm">rdk_city</code> — seçtiğiniz ili hatırlar
              (hava durumu ve namaz vakti). Onaylamazsanız tercih kalıcı yazılmaz.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-ink">Kendi sunucumuzda tutulan veriler</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Üyelik: ad, e-posta, şifre özeti (hash), isteğe bağlı fotoğraf ve biyografi</li>
              <li>Yorum, haber gönderimi, ihbar, iletişim ve bülten formu — yazdığınız içerik</li>
              <li>Haber okunma sayısı: habere +1; IP veya cihaz kimliği kaydedilmez</li>
              <li>Kötüye kullanım limiti: IP kısa süre bellekte tutulur, veritabanına yazılmaz</li>
            </ul>
            <p className="mt-3">
              Bu veriler reklam ağına satılmaz. Form ve üyelik, sizin gönderiminizle oluşur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-ink">Analiz ve reklam (üçüncü taraf)</h2>
            <p className="mt-2">
              Yalnızca yönetim panelinde kimlik girilmişse ve siz onaylarsanız Google script’leri yüklenir.
              Onay yoksa bu script’ler hiç eklenmez.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-ink">Haklarınız</h2>
            <p className="mt-2">
              KVKK m.11 kapsamındaki erişim, düzeltme ve silme taleplerini{" "}
              <Link href="/iletisim" className="font-semibold text-brand hover:underline">
                İletişim
              </Link>{" "}
              sayfasından iletebilirsiniz. Ayrıntılı metin:{" "}
              <Link href="/sayfa/kvkk" className="font-semibold text-brand hover:underline">
                KVKK
              </Link>{" "}
              ve{" "}
              <Link href="/sayfa/gizlilik" className="font-semibold text-brand hover:underline">
                Gizlilik
              </Link>
              .
            </p>
          </section>

          <CookieSettingsButton className="text-sm font-bold text-brand hover:underline" />
        </div>
      </Container>
    </>
  );
}
