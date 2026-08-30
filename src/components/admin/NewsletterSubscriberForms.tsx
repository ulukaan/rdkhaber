"use client";

import { clientFormSubmit } from "@/lib/client-form";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addNewsletterSubscriberAction,
  importNewsletterSubscribersAction,
} from "@/actions/newsletter";
import { FieldGroup, Input, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { FormCard } from "@/components/admin/FormCard";
import { Users } from "lucide-react";

export function NewsletterSubscriberForms() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkOk, setBulkOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const onAdd = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const result = await addNewsletterSubscriberAction({
      email: String(formData.get("email") ?? ""),
      name: String(formData.get("name") ?? ""),
    });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    (document.getElementById("bulten-abone-form") as HTMLFormElement | null)?.reset();
    router.refresh();
  };

  const onImport = async (formData: FormData) => {
    setBulkLoading(true);
    setBulkError(null);
    setBulkOk(null);
    const result = await importNewsletterSubscribersAction(String(formData.get("list") ?? ""));
    setBulkLoading(false);
    if (result?.error) {
      setBulkError(result.error);
      return;
    }
    setBulkOk(`${result.total} satır işlendi, ${result.added} yeni abone.`);
    router.refresh();
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <FormCard title="Abone ekle" description="Tek e-posta ile listenize ekleyin." Icon={Users}>
        <form id="bulten-abone-form" onSubmit={clientFormSubmit(onAdd)} className="flex flex-col gap-3">
          <FieldGroup label="E-posta" htmlFor="sub-email">
            <Input id="sub-email" name="email" type="email" required placeholder="ornek@mail.com" />
          </FieldGroup>
          <FieldGroup label="Ad (isteğe bağlı)" htmlFor="sub-name">
            <Input id="sub-name" name="name" placeholder="Ad Soyad" />
          </FieldGroup>
          {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}
          <Button type="submit" disabled={loading}>
            {loading ? "Ekleniyor..." : "Abone ekle"}
          </Button>
        </form>
      </FormCard>

      <FormCard title="Liste yapıştır" description="Her satır: eposta veya eposta, ad">
        <form onSubmit={clientFormSubmit(onImport)} className="flex flex-col gap-3">
          <Textarea
            name="list"
            rows={7}
            placeholder={"ahmet@mail.com, Ahmet Yılmaz\nayse@mail.com"}
          />
          {bulkError ? <p className="text-sm font-medium text-brand">{bulkError}</p> : null}
          {bulkOk ? <p className="text-sm font-medium text-emerald-700">{bulkOk}</p> : null}
          <Button type="submit" variant="outline" disabled={bulkLoading}>
            {bulkLoading ? "İşleniyor..." : "İçe aktar"}
          </Button>
        </form>
      </FormCard>
    </div>
  );
}
