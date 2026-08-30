import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Th, Td, EmptyRow } from "@/components/admin/Table";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { deleteUserAction } from "@/actions/user";
import { roleLabel } from "@/lib/role";

export const metadata = { title: "Kullanıcılar" };

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <PageHeader
        title="Kullanıcılar"
        description="Yönetici, editör ve üye hesaplarını yönetin."
        action={
          <Button href="/admin/kullanicilar/yeni" size="sm">
            <Plus className="h-4 w-4" /> Yeni Kullanıcı
          </Button>
        }
      />
      <Table>
        <thead>
          <tr>
            <Th>Ad Soyad</Th>
            <Th>E-posta</Th>
            <Th>Rol</Th>
            <Th>Durum</Th>
            <Th className="text-right">İşlemler</Th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && <EmptyRow colSpan={5}>Kullanıcı yok.</EmptyRow>}
          {users.map((u) => (
            <tr key={u.id}>
              <Td className="font-semibold text-ink">{u.name}</Td>
              <Td className="text-ink-soft">{u.email}</Td>
              <Td>
                <Badge variant={u.role === "ADMIN" ? "brand" : "outline"}>
                  {roleLabel(u.role)}
                </Badge>
              </Td>
              <Td>
                <Badge variant={u.active ? "brand" : "dark"}>
                  {u.active ? "Aktif" : "Pasif"}
                </Badge>
              </Td>
              <Td>
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/kullanicilar/${u.id}`}
                    className="text-ink-soft hover:text-brand"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <DeleteButton id={u.id} action={deleteUserAction} />
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
