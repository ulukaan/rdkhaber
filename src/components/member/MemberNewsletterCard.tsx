"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { setMemberNewsletterAction } from "@/actions/newsletter";
import { Button } from "@/components/ui/Button";
import { FormCard } from "@/components/admin/FormCard";

export function MemberNewsletterCard({ subscribed }: { subscribed: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(subscribed);

  const onToggle = async () => {
    setLoading(true);
    setError(null);
    const next = !active;
    const result = await setMemberNewsletterAction(next);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setActive(next);
  };

  return (
    <FormCard
      title="E-posta bülteni"
      description="Günün öne çıkan haberlerini e-posta kutunuza alın."
      Icon={Mail}
    >
      <p className="text-sm leading-relaxed text-ink-soft">
        {active
          ? "Bülten aboneliğiniz açık. İstediğiniz zaman durdurabilirsiniz."
          : "Şu an bülten almıyorsunuz. Abone olursanız önemli haberler e-postanıza gelir."}
      </p>
      {error ? <p className="mt-3 text-sm font-medium text-brand">{error}</p> : null}
      <div className="mt-4">
        <Button type="button" variant={active ? "outline" : "primary"} onClick={onToggle} disabled={loading}>
          {loading ? "Kaydediliyor..." : active ? "Aboneliği durdur" : "Bültene abone ol"}
        </Button>
      </div>
    </FormCard>
  );
}
