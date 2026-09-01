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
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Denetim kaydı" };

export default async function AuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <>
      <PageHeader
        title="Denetim kaydı"
        description="Panel işlemlerinin son 200 kaydı — giriş, düzenleme, toplu işlemler."
      />

      <PanelMobileOnly>
        {logs.length === 0 ? (
          <PanelMobileEmpty>Henüz kayıt yok.</PanelMobileEmpty>
        ) : (
          <PanelMobileList>
            {logs.map((log) => (
              <PanelMobileCard key={log.id}>
                <PanelMobileCardBody>
                  <p className="font-mono text-xs font-semibold text-ink">{log.action}</p>
                  <p className="mt-2 text-sm font-semibold text-ink">
                    {log.user?.name ?? "—"}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {log.entity
                      ? `${log.entity}${log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}`
                      : "—"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-soft">
                    <span>{formatDate(log.createdAt)}</span>
                    {log.ip ? <span>IP: {log.ip}</span> : null}
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
              <Th>Tarih</Th>
              <Th>Kullanıcı</Th>
              <Th>İşlem</Th>
              <Th>Varlık</Th>
              <Th>IP</Th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <EmptyRow colSpan={5}>Henüz kayıt yok.</EmptyRow>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <Td className="whitespace-nowrap text-xs text-ink-soft">
                    {formatDate(log.createdAt)}
                  </Td>
                  <Td className="text-sm">
                    {log.user ? (
                      <span className="font-semibold text-ink">{log.user.name}</span>
                    ) : (
                      <span className="text-ink-soft">—</span>
                    )}
                  </Td>
                  <Td className="font-mono text-xs text-ink">{log.action}</Td>
                  <Td className="text-xs text-ink-soft">
                    {log.entity ? `${log.entity}${log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}` : "—"}
                  </Td>
                  <Td className="text-xs text-ink-soft">{log.ip ?? "—"}</Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </PanelDesktopOnly>
    </>
  );
}
