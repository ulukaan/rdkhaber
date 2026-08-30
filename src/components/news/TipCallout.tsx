"use client";

import Link from "next/link";
import { Megaphone } from "lucide-react";
import { whatsappUrl } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";

export function TipCallout({ whatsappNumber }: { whatsappNumber: string }) {
  const wa = whatsappUrl(whatsappNumber);
  return (
    <section className="mt-8 overflow-hidden border border-border bg-white">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-brand text-white">
            <Megaphone className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-extrabold text-ink">İhbar bırakın</h2>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-ink-soft">
              Bu habere dair görüntü, belge veya tanıklığınız varsa haber masamıza iletin.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-1.5 bg-[#25D366] px-4 text-sm font-semibold text-white hover:bg-[#1ebe57]"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </a>
          ) : null}
          <Link
            href="/ihbar-hatti"
            className="inline-flex h-10 items-center bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            İhbar formu
          </Link>
        </div>
      </div>
    </section>
  );
}
