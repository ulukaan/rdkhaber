import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Th, Td, EmptyRow } from "@/components/admin/Table";
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
    </>
  );
}
