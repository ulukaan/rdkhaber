import Link from "next/link";
import { Film, Image as ImageIcon } from "lucide-react";
import {
  isImageAttachment,
  isVideoAttachment,
  parseAttachmentUrls,
} from "@/lib/attachments";

export function AttachmentPreview({ raw }: { raw: string | null | undefined }) {
  const urls = parseAttachmentUrls(raw);
  if (urls.length === 0) return null;

  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {urls.map((url) => (
        <li key={url}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border border-border bg-white px-2 py-1 text-[11px] font-semibold text-ink hover:border-brand hover:text-brand"
          >
            {isImageAttachment(url) ? (
              <ImageIcon className="h-3.5 w-3.5" aria-hidden />
            ) : isVideoAttachment(url) ? (
              <Film className="h-3.5 w-3.5" aria-hidden />
            ) : null}
            {url.split("/").pop()}
          </a>
        </li>
      ))}
    </ul>
  );
}
