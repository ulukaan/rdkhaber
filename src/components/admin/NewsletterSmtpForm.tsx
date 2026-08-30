"use client";

import { clientFormSubmit } from "@/lib/client-form";

import { useState } from "react";
import { saveNewsletterSmtpAction, sendNewsletterTestAction } from "@/actions/newsletter";
import { FieldGroup, Input, Select } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { FormCard, FieldGrid, FieldHint } from "@/components/admin/FormCard";
import { Mail } from "lucide-react";

export function NewsletterSmtpForm({
  defaults,
}: {
  defaults: {
    newsletterFromName: string;
    newsletterFromEmail: string;
    newsletterSmtpHost: string;
    newsletterSmtpPort: string;
    newsletterSmtpUser: string;
    newsletterSmtpPass: string;
    newsletterSmtpSecure: string;
  };
}) {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState(defaults.newsletterFromEmail);
  const [testing, setTesting] = useState(false);

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    setOk(null);
    const result = await saveNewsletterSmtpAction(Object.fromEntries(formData.entries()));
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setOk("Ayarlar kaydedildi.");
  };

  const onTest = async () => {
    setTesting(true);
    setError(null);
    setOk(null);
    const result = await sendNewsletterTestAction(testEmail);
    setTesting(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setOk("Test e-postası gönderildi. Gelen kutusunu kontrol edin.");
  };

  return (
    <FormCard
      title="Gönderim ayarları"
      description="Hostinger e-posta için smtp.hostinger.com, port 587."
      Icon={Mail}
    >
      <form onSubmit={clientFormSubmit(onSubmit)} className="flex flex-col gap-4">
        <FieldGrid>
          <FieldGroup label="Gönderen adı" htmlFor="nl-from-name">
            <Input
              id="nl-from-name"
              name="newsletterFromName"
              defaultValue={defaults.newsletterFromName}
              placeholder="Düzce Radikal"
            />
          </FieldGroup>
          <FieldGroup label="Gönderen e-posta" htmlFor="nl-from-email">
            <Input
              id="nl-from-email"
              name="newsletterFromEmail"
              type="email"
              defaultValue={defaults.newsletterFromEmail}
              placeholder="info@duzceradikal.com"
            />
          </FieldGroup>
          <FieldGroup label="SMTP sunucu" htmlFor="nl-host">
            <Input
              id="nl-host"
              name="newsletterSmtpHost"
              defaultValue={defaults.newsletterSmtpHost}
              placeholder="smtp.hostinger.com"
            />
          </FieldGroup>
          <FieldGroup label="Port" htmlFor="nl-port">
            <Input
              id="nl-port"
              name="newsletterSmtpPort"
              defaultValue={defaults.newsletterSmtpPort || "587"}
            />
          </FieldGroup>
          <FieldGroup label="SMTP kullanıcı" htmlFor="nl-user">
            <Input
              id="nl-user"
              name="newsletterSmtpUser"
              defaultValue={defaults.newsletterSmtpUser}
              autoComplete="off"
            />
          </FieldGroup>
          <FieldGroup label="SMTP şifre" htmlFor="nl-pass">
            <Input
              id="nl-pass"
              name="newsletterSmtpPass"
              type="password"
              placeholder={defaults.newsletterSmtpPass ? "Kayıtlı şifreyi korumak için boş bırakın" : ""}
              autoComplete="new-password"
            />
            <FieldHint>Boş bırakırsanız mevcut şifre değişmez.</FieldHint>
          </FieldGroup>
          <FieldGroup label="Şifreleme" htmlFor="nl-secure">
            <Select
              id="nl-secure"
              name="newsletterSmtpSecure"
              defaultValue={defaults.newsletterSmtpSecure === "1" ? "1" : "0"}
            >
              <option value="0">STARTTLS (587)</option>
              <option value="1">SSL (465)</option>
            </Select>
          </FieldGroup>
        </FieldGrid>
        {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}
        {ok ? <p className="text-sm font-medium text-emerald-700">{ok}</p> : null}
        <div className="flex flex-wrap items-end gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Ayarları kaydet"}
          </Button>
          <Input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Test alıcısı"
            className="max-w-xs"
          />
          <Button type="button" variant="outline" onClick={onTest} disabled={testing || !testEmail}>
            {testing ? "Gönderiliyor..." : "Test gönder"}
          </Button>
        </div>
      </form>
    </FormCard>
  );
}
