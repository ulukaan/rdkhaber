"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookUser } from "lucide-react";
import { createUserAction, updateUserAction } from "@/actions/user";
import { clientFormSubmit } from "@/lib/client-form";
import { FieldGroup, Input, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { FormCard } from "@/components/admin/FormCard";
import { FormActions } from "@/components/admin/PanelUI";

type AuthorDefaults = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  active?: boolean;
  slug?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
};

/**
 * Panel yazar formu — yeni kayıt EDITOR; düzenlemede mevcut rol korunur.
 */
export function AuthorForm({ defaults }: { defaults?: AuthorDefaults }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(defaults?.id);

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const password = String(formData.get("password") ?? "").trim();
    const role =
      isEdit && (defaults?.role === "ADMIN" || defaults?.role === "EDITOR")
        ? defaults.role
        : "EDITOR";
    const raw = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      password,
      role,
      active: formData.get("active") === "on",
      slug: String(formData.get("slug") ?? ""),
      bio: String(formData.get("bio") ?? ""),
      avatarUrl: String(formData.get("avatarUrl") ?? ""),
    };

    const result = isEdit
      ? await updateUserAction(defaults!.id!, raw)
      : await createUserAction(raw);

    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/yazarlar");
  };

  return (
    <FormCard
      title={isEdit ? "Yazarı düzenle" : "Yeni yazar"}
      description="Yazar profili sitede /yazarlar ve anasayfa Yazarlar bölümünde görünür."
      Icon={BookUser}
      className="max-w-xl"
    >
      <form onSubmit={clientFormSubmit(onSubmit)} className="flex flex-col gap-4">
        <FieldGroup label="Ad Soyad" htmlFor="name">
          <Input id="name" name="name" autoComplete="name" defaultValue={defaults?.name} required />
        </FieldGroup>
        <FieldGroup label="E-posta" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={defaults?.email}
            required
          />
        </FieldGroup>
        <FieldGroup label="Profil slug" htmlFor="slug">
          <Input
            id="slug"
            name="slug"
            defaultValue={defaults?.slug ?? ""}
            placeholder="ornek-yazar"
          />
          <p className="mt-1 text-xs text-ink-soft">
            Boş bırakılırsa addan üretilir. Profil: /yazar/slug
          </p>
        </FieldGroup>
        <FieldGroup label="Biyografi" htmlFor="bio">
          <Textarea id="bio" name="bio" rows={4} defaultValue={defaults?.bio ?? ""} />
        </FieldGroup>
        <FieldGroup label="Avatar URL" htmlFor="avatarUrl">
          <Input id="avatarUrl" name="avatarUrl" defaultValue={defaults?.avatarUrl ?? ""} />
        </FieldGroup>
        <FieldGroup
          label={isEdit ? "Yeni Şifre (değiştirmek için doldurun)" : "Şifre"}
          htmlFor="password"
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isEdit ? "off" : "new-password"}
            data-1p-ignore={isEdit ? true : undefined}
            data-lpignore={isEdit ? "true" : undefined}
            placeholder={isEdit ? "Değiştirmek istemiyorsanız boş bırakın" : undefined}
            required={!isEdit}
          />
        </FieldGroup>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            name="active"
            defaultChecked={defaults?.active ?? true}
            className="h-4 w-4 rounded border-border"
          />
          Aktif (sitede listelensin)
        </label>

        {error && <p className="text-sm font-medium text-brand">{error}</p>}

        <FormActions>
          <Button type="submit" disabled={loading}>
            {loading ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Yazar Ekle"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Vazgeç
          </Button>
        </FormActions>
      </form>
    </FormCard>
  );
}
