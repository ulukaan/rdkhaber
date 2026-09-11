"use client";

import { useEffect, useState } from "react";
import { savePushSubscriptionAction } from "@/actions/push-subscription";
import { getVapidPublicKeyClient } from "@/lib/web-push-client";
import { Button } from "@/components/ui/Button";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function PushSubscribeButton({ className = "" }: { className?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "unsupported" | "hidden">(
    "hidden",
  );
  const [publicKey, setPublicKey] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }
    const fromEnv = getVapidPublicKeyClient();
    if (fromEnv) {
      setPublicKey(fromEnv);
      setStatus("idle");
      return;
    }
    void fetch("/api/push/vapid-public")
      .then((r) => r.json())
      .then((data: { enabled?: boolean; publicKey?: string | null }) => {
        if (data.enabled && data.publicKey) {
          setPublicKey(data.publicKey);
          setStatus("idle");
        } else {
          setStatus("hidden");
        }
      })
      .catch(() => setStatus("hidden"));
  }, []);

  if (status === "hidden") return null;
  if (status === "unsupported") return null;

  const subscribe = async () => {
    setStatus("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("idle");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const json = sub.toJSON();
      await savePushSubscriptionAction({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" },
      });
      setStatus("done");
    } catch {
      setStatus("unsupported");
    }
  };

  if (status === "done") {
    return <p className={`text-xs font-semibold text-emerald-700 ${className}`}>Bildirimler açık.</p>;
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className={className}
      disabled={status === "loading" || !publicKey}
      onClick={subscribe}
    >
      {status === "loading" ? "Açılıyor..." : "Son dakika bildirimleri"}
    </Button>
  );
}
