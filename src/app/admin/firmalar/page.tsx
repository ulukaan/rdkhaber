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
import { CompanyActiveToggle } from "@/components/admin/CompanyActiveToggle";
import { deleteCompanyAction } from "@/actions/company";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Firma Rehberi" };

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <>
      <PageHeader
        title="Firma Rehberi"
        description="Ana sayfa vitrininde görünen sponsor / yerel firmalar."
        action={
          <Button href="/admin/firmalar/yeni" size="sm">
            <Plus className="h-4 w-4" /> Yeni Firma
          </Button>
        }
      />

      <PanelMobileOnly>
        {companies.length === 0 ? (
          <PanelMobileEmpty>Henüz firma yok.</PanelMobileEmpty>
        ) : (
          <PanelMobileList>
            {companies.map((company) => (
              <PanelMobileCard key={company.id}>
                <PanelMobileCardBody
                  footer={
                    <div className="flex flex-col gap-3">
                      <CompanyActiveToggle id={company.id} active={company.active} />
                      <div className="panel-row-actions flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/firmalar/${company.id}`}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border text-ink-soft active:text-brand"
                          aria-label="Düzenle"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <DeleteButton id={company.id} action={deleteCompanyAction} />
                      </div>
                    </div>
                  }
                >
                  <div className="flex items-center gap-3">
                    {company.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={company.logoUrl}
                        alt=""
                        className="h-12 w-12 rounded border border-border bg-white object-contain p-1"
                      />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded border border-border bg-surface text-xs text-ink-soft">
                        Logo
                      </span>
                    )}
                    <div>
                      <p className="text-sm font-bold text-ink">{company.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-ink-soft">
                        {company.category || "—"}
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
              <Th>Firma</Th>
              <Th>Faaliyet</Th>
              <Th>Sıra</Th>
              <Th>Durum</Th>
              <Th className="text-right">İşlemler</Th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 && <EmptyRow colSpan={5}>Henüz firma yok.</EmptyRow>}
            {companies.map((company) => (
              <tr key={company.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    {company.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={company.logoUrl}
                        alt=""
                        className="h-10 w-14 rounded border border-border bg-white object-contain p-1"
                      />
                    ) : null}
                    <span className="font-semibold text-ink">{company.name}</span>
                  </div>
                </Td>
                <Td className="uppercase text-ink-soft">{company.category || "—"}</Td>
                <Td>{company.order}</Td>
                <Td>
                  <CompanyActiveToggle id={company.id} active={company.active} />
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/firmalar/${company.id}`} className="text-ink-soft hover:text-brand">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <DeleteButton id={company.id} action={deleteCompanyAction} />
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </PanelDesktopOnly>
    </>
  );
}
