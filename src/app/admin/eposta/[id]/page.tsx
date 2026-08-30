import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { MailboxNav } from "@/components/admin/MailboxNav";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteMailboxMessageAction } from "@/actions/mailbox";
import { formatDate } from "@/lib/utils";
import sanitizeHtml from "sanitize-html";

export const metadata = { title: "E-posta detayı" };

export default async function MailboxMessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const message = await prisma.mailboxMessage.findUnique({ where: { id } });
  if (!message) notFound();

  if (message.direction === "INBOUND" && !message.isRead) {
    await prisma.mailboxMessage.update({
      where: { id },
      data: { isRead: true },
    });
  }

  const replyTo =
    message.direction === "INBOUND"
      ? encodeURIComponent(message.fromAddress.replace(/^.*<([^>]+)>.*$/, "$1").trim() || message.fromAddress)
      : encodeURIComponent(message.toAddress);

  const safeHtml = message.bodyHtml
    ? sanitizeHtml(message.bodyHtml, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3"]),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ["src", "alt", "width", "height"],
        },
      })
    : null;

  return (
    <>
      <PageHeader
        title={message.subject}
        description={formatDate(message.createdAt)}
        action={
          <div className="flex flex-wrap gap-2">
            {message.direction === "INBOUND" ? (
              <Button href={`/admin/eposta/yeni?to=${replyTo}`} size="sm">
                Yanıtla
              </Button>
            ) : null}
            <DeleteButton id={message.id} action={deleteMailboxMessageAction} />
          </div>
        }
      />
      <MailboxNav pathname={message.direction === "INBOUND" ? "/admin/eposta" : "/admin/eposta/giden"} />

      <article className="max-w-3xl rounded-xl border border-border bg-white p-6">
        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          <Badge variant={message.direction === "INBOUND" ? "brand" : "outline"}>
            {message.direction === "INBOUND" ? "Gelen" : "Giden"}
          </Badge>
          <Badge variant="outline">{message.source}</Badge>
        </div>
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="font-semibold text-ink-soft">Kimden</dt>
            <dd className="text-ink">{message.fromAddress}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-soft">Kime</dt>
            <dd className="text-ink">{message.toAddress}</dd>
          </div>
        </dl>
        <hr className="my-5 border-border" />
        {safeHtml ? (
          <div
            className="prose max-w-none text-ink"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        ) : (
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
            {message.bodyText || "(Boş mesaj)"}
          </pre>
        )}
      </article>

      <p className="mt-4">
        <Link href={message.direction === "INBOUND" ? "/admin/eposta" : "/admin/eposta/giden"} className="text-sm font-semibold text-brand hover:underline">
          ← Listeye dön
        </Link>
      </p>
    </>
  );
}
