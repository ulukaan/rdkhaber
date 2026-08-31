"use client";

import { useState } from "react";
import { UserRound } from "lucide-react";
import { updateOwnProfileAction } from "@/actions/profile";
import { clientFormSubmit } from "@/lib/client-form";
import { FieldGroup, Input, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { FormCard, FieldGrid, FieldHint } from "@/components/admin/FormCard";
import { FormActions } from "@/components/admin/PanelUI";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

type Props = {
  defaults: {
    name: string;
    email: string;
    bio: string | null;
    avatarUrl: string | null;
  };
};

export function MemberProfileForm({ defaults }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    setOk(null);
    const result = await updateOwnProfileAction({
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      bio: String(formData.get("bio") ?? ""),
      avatarUrl: String(formData.get("avatarUrl") ?? ""),
      password: String(formData.get("password") ?? "").trim(),
      currentPassword: String(formData.get("currentPassword") ?? ""),
    });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setOk("Profiliniz güncellendi.");
  };

  return (
    <FormCard
      title="Profil bilgileri"
      description="Ad, fotoğraf ve iletişim bilgileriniz. Şifre değiştirmek isteğe bağlıdır."
      Icon={UserRound}
    >
      <form onSubmit={clientFormSubmit(onSubmit)} className="flex flex-col gap-4">
        <FieldGroup label="Profil fotoğrafı" htmlFor="avatarUrl">
          <ImageUploadField name="avatarUrl" defaultValue={defaults.avatarUrl} variant="avatar" />
          <FieldHint>JPG, PNG veya WEBP. En fazla 2 MB.</FieldHint>
        </FieldGroup>

        <FieldGrid>
          <FieldGroup label="Ad Soyad" htmlFor="name">
            <Input id="name" name="name" autoComplete="name" defaultValue={defaults.name} required />
          </FieldGroup>
          <FieldGroup label="E-posta" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={defaults.email}
              required
            />
          </FieldGroup>
        </FieldGrid>

        <FieldGroup label="Hakkınızda" htmlFor="bio">
          <Textarea
            id="bio"
            name="bio"
            rows={4}
            defaultValue={defaults.bio ?? ""}
            placeholder="Kısaca kendinizden bahsedin (isteğe bağlı)"
          />
        </FieldGroup>

        <div className="rounded-lg border border-border bg-surface/60 p-4">
          <p className="mb-3 text-sm font-bold text-ink">Şifre değiştir</p>
          <FieldGrid>
            <FieldGroup label="Mevcut şifre" htmlFor="currentPassword">
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
              />
            </FieldGroup>
            <FieldGroup label="Yeni şifre" htmlFor="password">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="En az 10 karakter"
              />
              <FieldHint>Değiştirmek istemiyorsanız boş bırakın.</FieldHint>
            </FieldGroup>
          </FieldGrid>
        </div>

        {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}
        {ok ? <p className="text-sm font-medium text-emerald-700">{ok}</p> : null}

        <FormActions>
          <Button type="submit" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Profili kaydet"}
          </Button>
        </FormActions>
      </form>
    </FormCard>
  );
}
