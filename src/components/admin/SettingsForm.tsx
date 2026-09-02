"use client";

import { clientFormSubmit } from "@/lib/client-form";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Check,
  Globe,
  Megaphone,
  PanelBottom,
  Phone,
  Search,
  Share2,
} from "lucide-react";
import { updateSettingsAction } from "@/actions/settings";
import { FieldGroup, Input, Textarea } from "@/components/ui/FormField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { FormCard, FieldGrid, FieldHint } from "@/components/admin/FormCard";
import { Button } from "@/components/ui/Button";
import { PanelFormFooter, PANEL_FORM_BOTTOM_PAD } from "@/components/admin/PanelFormFooter";
import type { SettingKey } from "@/lib/settings";

export function SettingsForm({ settings }: { settings: Record<SettingKey, string> }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    setSaved(false);
    // Formda olmayan ayarların (ör. görünüm anahtarları) sıfırlanmaması için
    // mevcut değerlerin üzerine yazılır.
    const raw = {
      ...settings,
      ...Object.fromEntries(formData.entries()),
      editorRequiresApproval: formData.get("editorRequiresApproval") === "1" ? "1" : "0",
      socialAutoShare: formData.get("socialAutoShare") === "1" ? "1" : "0",
      metaDescription: String(formData.get("metaDescription") ?? ""),
      metaKeywords: String(formData.get("metaKeywords") ?? ""),
    };
    const result = await updateSettingsAction(raw);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setSaved(true);
    router.refresh();
  };

  return (
    <form
      key={[
        settings.metaDescription,
        settings.metaKeywords,
        settings.siteName,
        settings.siteSlogan,
      ].join("\0")}
      onSubmit={clientFormSubmit(onSubmit)}
      className={`flex flex-col gap-5 ${PANEL_FORM_BOTTOM_PAD}`}
    >
      <FormCard
        title="Site Kimliği"
        description="Sitenin adı, logosu ve marka rengi. Logo hem sitede hem yönetim panelinde görünür."
        Icon={Globe}
      >
        <FieldGrid>
          <FieldGroup label="Site adı" htmlFor="siteName">
            <Input id="siteName" name="siteName" defaultValue={settings.siteName} required />
            <FieldHint>Sekme başlığında ve logo yoksa yazı olarak kullanılır.</FieldHint>
          </FieldGroup>
          <FieldGroup label="Slogan" htmlFor="siteSlogan">
            <Input id="siteSlogan" name="siteSlogan" defaultValue={settings.siteSlogan} />
            <FieldHint>Alt bilgide ve arama sonuçlarında görünebilir.</FieldHint>
          </FieldGroup>
        </FieldGrid>

        <FieldGrid className="mt-4">
          <FieldGroup label="Logo" htmlFor="logoUrl">
            <ImageUploadField name="logoUrl" defaultValue={settings.logoUrl} />
            <FieldHint>Boş bırakılırsa site adı yazı olarak gösterilir.</FieldHint>
          </FieldGroup>
          <FieldGroup label="Favicon" htmlFor="faviconUrl">
            <ImageUploadField name="faviconUrl" defaultValue={settings.faviconUrl} />
            <FieldHint>Tarayıcı sekmesinde görünen küçük simge (32x32 önerilir).</FieldHint>
          </FieldGroup>
        </FieldGrid>

        <div className="mt-4">
          <FieldGroup label="Marka rengi" htmlFor="brandColor">
            <Input
              id="brandColor"
              name="brandColor"
              type="color"
              defaultValue={settings.brandColor || "#d0021b"}
              className="h-10 w-24 p-1"
            />
            <FieldHint>Butonlar, bağlantılar ve vurgular bu renkten türetilir.</FieldHint>
          </FieldGroup>
        </div>
      </FormCard>

      <FormCard
        title="İletişim Bilgileri"
        description="İletişim sayfasında ve alt bilgide gösterilir."
        Icon={Phone}
      >
        <FieldGrid>
          <FieldGroup label="İletişim e-postası" htmlFor="contactEmail">
            <Input id="contactEmail" name="contactEmail" type="email" defaultValue={settings.contactEmail} placeholder="info@duzceradikal.com" />
          </FieldGroup>
          <FieldGroup label="Telefon" htmlFor="contactPhone">
            <Input id="contactPhone" name="contactPhone" defaultValue={settings.contactPhone} placeholder="0380 000 00 00" />
          </FieldGroup>
          <FieldGroup label="WhatsApp hattı" htmlFor="whatsappNumber">
            <Input
              id="whatsappNumber"
              name="whatsappNumber"
              defaultValue={settings.whatsappNumber}
              placeholder="90XXXXXXXXXX"
              required
            />
            <FieldHint>Ülke kodu ile, başında + olmadan yazın.</FieldHint>
          </FieldGroup>
          <FieldGroup label="Adres" htmlFor="contactAddress">
            <Input id="contactAddress" name="contactAddress" defaultValue={settings.contactAddress} />
          </FieldGroup>
        </FieldGrid>
      </FormCard>

      <FormCard
        title="İhbar Hattı"
        description="Okuyucuların isimsiz bildirim gönderdiği kanal."
        Icon={Megaphone}
      >
        <FieldGrid>
          <FieldGroup label="İhbar telefonu" htmlFor="tipLinePhone">
            <Input id="tipLinePhone" name="tipLinePhone" defaultValue={settings.tipLinePhone} />
          </FieldGroup>
          <FieldGroup label="İhbar e-postası" htmlFor="tipLineEmail">
            <Input id="tipLineEmail" name="tipLineEmail" type="email" defaultValue={settings.tipLineEmail} placeholder="info@duzceradikal.com" />
          </FieldGroup>
        </FieldGrid>
      </FormCard>

      <FormCard
        title="Sosyal Medya"
        description="Boş bırakılan hesaplar sitede hiç gösterilmez."
        Icon={Share2}
      >
        <FieldGrid>
          <FieldGroup label="Facebook" htmlFor="facebookUrl">
            <Input id="facebookUrl" name="facebookUrl" defaultValue={settings.facebookUrl} placeholder="https://facebook.com/..." />
          </FieldGroup>
          <FieldGroup label="X (Twitter)" htmlFor="twitterUrl">
            <Input id="twitterUrl" name="twitterUrl" defaultValue={settings.twitterUrl} placeholder="https://x.com/..." />
          </FieldGroup>
          <FieldGroup label="Instagram" htmlFor="instagramUrl">
            <Input id="instagramUrl" name="instagramUrl" defaultValue={settings.instagramUrl} placeholder="https://instagram.com/..." />
          </FieldGroup>
          <FieldGroup label="YouTube" htmlFor="youtubeUrl">
            <Input id="youtubeUrl" name="youtubeUrl" defaultValue={settings.youtubeUrl} placeholder="https://youtube.com/@..." />
          </FieldGroup>
        </FieldGrid>
      </FormCard>

      <FormCard
        title="SEO"
        description="Arama motorlarına ve paylaşım önizlemelerine gönderilen bilgiler."
        Icon={Search}
      >
        <FieldGroup label="Meta açıklama" htmlFor="metaDescription">
          <Textarea
            id="metaDescription"
            name="metaDescription"
            rows={3}
            defaultValue={settings.metaDescription}
            placeholder="Sitenizi 150-160 karakterle özetleyin."
          />
          <FieldHint>Boş bırakılırsa slogan kullanılır.</FieldHint>
        </FieldGroup>
        <div className="mt-4">
          <FieldGroup label="Anahtar kelimeler" htmlFor="metaKeywords">
            <Input
              id="metaKeywords"
              name="metaKeywords"
              defaultValue={settings.metaKeywords}
              placeholder="düzce haber, son dakika, yerel haber"
            />
            <FieldHint>Virgülle ayırın.</FieldHint>
          </FieldGroup>
        </div>
      </FormCard>

      <FormCard
        title="Alt Bilgi"
        description="Sitenin en altında görünen tanıtım ve telif metni."
        Icon={PanelBottom}
      >
        <FieldGroup label="Alt bilgi tanıtım yazısı" htmlFor="footerAbout">
          <Textarea
            id="footerAbout"
            name="footerAbout"
            rows={3}
            defaultValue={settings.footerAbout}
            placeholder="Yayın çizginizi kısaca tanıtın."
          />
          <FieldHint>Boş bırakılırsa slogan kullanılır.</FieldHint>
        </FieldGroup>
        <div className="mt-4">
          <FieldGroup label="Telif metni" htmlFor="copyrightText">
            <Input
              id="copyrightText"
              name="copyrightText"
              defaultValue={settings.copyrightText}
              placeholder="© 2026 Site Adı. Tüm hakları saklıdır."
            />
            <FieldHint>Boş bırakılırsa yıl ve site adı ile otomatik oluşturulur.</FieldHint>
          </FieldGroup>
        </div>
      </FormCard>

      <FormCard
        title="Editöryal & dağıtım"
        description="Onay akışı, otomatik sosyal paylaşım ve BİK bilgisi."
        Icon={Megaphone}
      >
        <FieldGrid>
          <label className="flex min-h-[44px] items-center gap-2 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              name="editorRequiresApproval"
              value="1"
              defaultChecked={settings.editorRequiresApproval === "1"}
              className="h-4 w-4 accent-brand"
            />
            Editör yayını admin onayı gerektirsin
          </label>
          <label className="flex min-h-[44px] items-center gap-2 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              name="socialAutoShare"
              value="1"
              defaultChecked={settings.socialAutoShare === "1"}
              className="h-4 w-4 accent-brand"
            />
            Yayında otomatik sosyal paylaşım (Telegram/X webhook)
          </label>
        </FieldGrid>
        <div className="mt-4">
          <FieldGroup label="BİK yayıncı kodu (opsiyonel)" htmlFor="bikPublisherCode">
            <Input
              id="bikPublisherCode"
              name="bikPublisherCode"
              defaultValue={settings.bikPublisherCode}
              placeholder="Resmî ilan alıyorsanız"
            />
          </FieldGroup>
        </div>
      </FormCard>

      <PanelFormFooter>
        {error ? <p className="mr-auto w-full text-sm font-medium text-brand sm:w-auto">{error}</p> : null}
        {saved ? (
          <p className="mr-auto flex w-full items-center gap-1.5 text-sm font-medium text-emerald-600 sm:w-auto">
            <Check className="h-4 w-4" /> Ayarlar kaydedildi.
          </p>
        ) : null}
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </Button>
      </PanelFormFooter>
    </form>
  );
}
