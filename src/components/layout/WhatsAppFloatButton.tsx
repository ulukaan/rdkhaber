"use client";

import { whatsappUrl } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";

export function WhatsAppFloatButton({ whatsappNumber }: { whatsappNumber: string }) {
  const href = whatsappUrl(whatsappNumber);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp İhbar Hattı"
      className="whatsapp-float fixed bottom-5 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform active:scale-95 sm:right-5 sm:h-14 sm:w-14"
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <WhatsAppIcon className="h-6 w-6 sm:h-7 sm:w-7" />
    </a>
  );
}
