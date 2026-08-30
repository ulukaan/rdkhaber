"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendNewsletterCampaignAction, sendNewsletterTestAction } from "@/actions/newsletter";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormField";
import { PanelCard } from "@/components/admin/PanelUI";

export function NewsletterSendBar({
  campaignId,
  subscriberCount,
  sent,
}: {
  campaignId: string;
  subscriberCount: number;
  sent: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");

  const sendAll = () => {
    if (
      !window.confirm(
        `${subscriberCount} aboneye bülten gönderilecek. Devam etmek istiyor musunuz?`,
      )
    ) {
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const result = await sendNewsletterCampaignAction(campaignId);
      if (result.error && !result.sentCount) {
        setMessage(result.error);
      } else {
        setMessage(
          `${result.sentCount ?? 0} kişiye gitti${result.failCount ? `, ${result.failCount} hata` : ""}.`,
        );
      }
      router.refresh();
    });
  };

  const sendTest = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await sendNewsletterTestAction(testEmail, campaignId);
      setMessage(result.error ?? "Test e-postası gönderildi.");
    });
  };

  if (sent) {
    return (
      <PanelCard>
        <p className="text-sm font-semibold text-emerald-700">Bu bülten gönderildi.</p>
      </PanelCard>
    );
  }

  return (
    <PanelCard>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-xs font-semibold text-ink-soft" htmlFor="nl-test">
            Test e-postası
          </label>
          <Input
            id="nl-test"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="once-kendinize-gonderin@mail.com"
          />
        </div>
        <Button type="button" variant="outline" onClick={sendTest} disabled={pending || !testEmail}>
          Test gönder
        </Button>
        <Button type="button" onClick={sendAll} disabled={pending || subscriberCount === 0}>
          {pending ? "Gönderiliyor..." : `Abonelere gönder (${subscriberCount})`}
        </Button>
      </div>
      {message ? <p className="mt-3 text-sm text-ink-soft">{message}</p> : null}
    </PanelCard>
  );
}
