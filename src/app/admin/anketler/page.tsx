import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Th, Td, EmptyRow } from "@/components/admin/Table";
import {
  PanelDesktopOnly,
  PanelMobileCard,
  PanelMobileCardBody,
  PanelMobileEmpty,
  PanelMobileList,
  PanelMobileOnly,
} from "@/components/admin/PanelMobileList";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { PollActiveToggle } from "@/components/admin/PollActiveToggle";
import { deletePollAction } from "@/actions/poll";
import { Button } from "@/components/ui/Button";
import { isPollOpen } from "@/lib/polls";

export const metadata = { title: "Anketler" };

export default async function PollsPage() {
  const polls = await prisma.poll.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      article: { select: { title: true, slug: true } },
      options: { select: { id: true } },
      _count: { select: { votes: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Anketler"
        description="Okuyucu anketlerini oluşturun, ana sayfada veya haberlerde yayınlayın."
        action={
          <Button href="/admin/anketler/yeni" size="sm">
            <Plus className="h-4 w-4" /> Yeni Anket
          </Button>
        }
      />

      <PanelMobileOnly>
        {polls.length === 0 ? (
          <PanelMobileEmpty>Henüz anket yok.</PanelMobileEmpty>
        ) : (
          <PanelMobileList>
            {polls.map((poll) => {
              const open = isPollOpen(poll.endsAt, poll.active);
              return (
                <PanelMobileCard key={poll.id}>
                  <PanelMobileCardBody
                    footer={
                      <div className="flex flex-col gap-3">
                        <PollActiveToggle pollId={poll.id} active={poll.active} open={open} />
                        <div className="panel-row-actions flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/anketler/${poll.id}`}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border text-ink-soft active:text-brand"
                            aria-label="Düzenle"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <DeleteButton id={poll.id} action={deletePollAction} />
                        </div>
                      </div>
                    }
                  >
                    <p className="text-sm font-bold text-ink">{poll.question}</p>
                    <p className="mt-2 text-xs text-ink-soft">
                      {poll.article ? (
                        <Link href={`/haber/${poll.article.slug}`} className="text-brand hover:underline">
                          {poll.article.title}
                        </Link>
                      ) : (
                        "Ana sayfa"
                      )}
                    </p>
                    <p className="mt-2 text-xs text-ink-soft">
                      {poll.options.length} seçenek · {poll._count.votes} oy
                    </p>
                  </PanelMobileCardBody>
                </PanelMobileCard>
              );
            })}
          </PanelMobileList>
        )}
      </PanelMobileOnly>

      <PanelDesktopOnly>
        <Table>
          <thead>
            <tr>
              <Th>Soru</Th>
              <Th>Konum</Th>
              <Th>Seçenek</Th>
              <Th>Oy</Th>
              <Th>Durum</Th>
              <Th className="text-right">İşlemler</Th>
            </tr>
          </thead>
          <tbody>
            {polls.length === 0 && <EmptyRow colSpan={6}>Henüz anket yok.</EmptyRow>}
            {polls.map((poll) => {
              const open = isPollOpen(poll.endsAt, poll.active);
              return (
                <tr key={poll.id}>
                  <Td className="max-w-xs font-semibold text-ink">{poll.question}</Td>
                  <Td className="text-ink-soft">
                    {poll.article ? (
                      <Link href={`/haber/${poll.article.slug}`} className="hover:text-brand">
                        {poll.article.title}
                      </Link>
                    ) : (
                      "Ana sayfa"
                    )}
                  </Td>
                  <Td>{poll.options.length}</Td>
                  <Td>{poll._count.votes}</Td>
                  <Td>
                    <PollActiveToggle pollId={poll.id} active={poll.active} open={open} />
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/anketler/${poll.id}`} className="text-ink-soft hover:text-brand">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteButton id={poll.id} action={deletePollAction} />
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </PanelDesktopOnly>
    </>
  );
}
