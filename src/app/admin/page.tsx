import { DashboardPage } from "@/components/admin/pages/DashboardPage";

export const metadata = { title: "Yönetim Paneli" };

export default function Page() {
  return <DashboardPage role="ADMIN" />;
}
