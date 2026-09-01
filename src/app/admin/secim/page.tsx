import Link from "next/link";
import { Plus, ExternalLink, Vote } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import {
  PanelDesktopOnly,
  PanelMobileCard,
  PanelMobileCardBody,
  PanelMobileEmpty,
  PanelMobileList,
  PanelMobileOnly,
} from "@/components/admin/PanelMobileList";
import { Table, Th, Td, EmptyRow } from "@/components/admin/Table";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteElectionAction } from "@/actions/election";
import { ELECTION_STATUS_LABELS } from "@/lib/election";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Seçim Merkezi" };

export default async function AdminElectionsPage() {
  const elections = await prisma.election.findMany({
    orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
    include: {
      _count: { select: { candidates: true, districts: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Seçim Merkezi"
        description="Aday vitrini, sandık verileri ve ilçe sonuçları — NTV tarzı seçim ekranı."
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button href="/secim" variant="outline" size="sm" className="w-full sm:w-auto">
              <ExternalLink className="h-4 w-4" /> Sayfayı aç
            </Button>
            <Button href="/admin/secim/yeni" size="sm" className="w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Yeni seçim
            </Button>
          </div>
        }
      />

      <PanelMobileOnly>
        {elections.length === 0 ? (
          <PanelMobileEmpty>Henüz seçim tanımı yok.</PanelMobileEmpty>
        ) : (
          <PanelMobileList>
            {elections.map((election) => (
              <PanelMobileCard key={election.id}>
                <PanelMobileCardBody>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <Vote className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link href={`/admin/secim/${election.id}`} className="block text-sm font-bold text-ink hover:text-brand">
                        {election.title}
                      </Link>
                      <p className="mt-1 text-xs text-ink-soft">
                        {ELECTION_STATUS_LABELS[election.status]}
                        {election.isPrimary ? " · Birincil" : ""}
                      </p>
                      <p className="mt-1 text-xs text-ink-soft">
                        {election._count.candidates} aday · {election._count.districts} ilçe
                      </p>
                    </div>
                  </div>
                </PanelMobileCardBody>
              </PanelMobileCard>
            ))}
          </PanelMobileList>
        )}
      </PanelMobileOnly>

      <PanelDesktopOnly>
        <Table>
          <thead>
            <tr>
              <Th>Başlık</Th>
              <Th>Durum</Th>
              <Th>Aday</Th>
              <Th>Güncelleme</Th>
              <Th>İşlem</Th>
            </tr>
          </thead>
          <tbody>
            {elections.length === 0 ? (
              <EmptyRow colSpan={5}>Henüz seçim tanımı yok.</EmptyRow>
            ) : (
              elections.map((election) => (
                <tr key={election.id}>
                  <Td className="font-semibold text-ink">
                    <Link href={`/admin/secim/${election.id}`} className="hover:text-brand">
                      {election.title}
                    </Link>
                    {election.isPrimary ? (
                      <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase text-brand">
                        Birincil
                      </span>
                    ) : null}
                  </Td>
                  <Td>{ELECTION_STATUS_LABELS[election.status]}</Td>
                  <Td>{election._count.candidates}</Td>
                  <Td className="text-xs text-ink-soft">{formatDate(election.updatedAt)}</Td>
                  <Td>
                    <DeleteButton
                      id={election.id}
                      action={deleteElectionAction}
                      confirmText={`“${election.title}” silinsin mi?`}
                    />
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </PanelDesktopOnly>
    </>
  );
}
