"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { sendComposeMailAction } from "@/actions/mailbox";
import { clientFormSubmit } from "@/lib/client-form";
import { FieldGroup, Input, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { FormCard } from "@/components/admin/FormCard";

export function MailboxComposeForm({ defaultTo = "" }: { defaultTo?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const result = await sendComposeMailAction({
      to: String(formData.get("to") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      body: String(formData.get("body") ?? ""),
    });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/eposta/giden");
    router.refresh();
  };

  return (
    <FormCard title="Yeni e-posta" description="Kurumsal şablonla alıcıya iletin." Icon={Send} className="max-w-2xl">
      <form onSubmit={clientFormSubmit(onSubmit)} className="flex flex-col gap-4">
        <FieldGroup label="Alıcı" htmlFor="mail-to">
          <Input id="mail-to" name="to" type="email" required defaultValue={defaultTo} placeholder="alici@mail.com" />
        </FieldGroup>
        <FieldGroup label="Konu" htmlFor="mail-subject">
          <Input id="mail-subject" name="subject" required placeholder="Konu satırı" />
        </FieldGroup>
        <FieldGroup label="Mesaj" htmlFor="mail-body">
          <Textarea id="mail-body" name="body" rows={12} required placeholder="Mesajınızı yazın..." />
        </FieldGroup>
        {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}
        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Gönderiliyor..." : "Gönder"}
          </Button>
          <Button href="/admin/eposta/giden" variant="outline">
            Vazgeç
          </Button>
        </div>
      </form>
    </FormCard>
  );
}
