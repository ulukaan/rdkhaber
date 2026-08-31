import { listNotificationsAction } from "@/actions/notifications";
import { NotificationList } from "@/components/account/NotificationList";

export const metadata = { title: "Bildirimler" };

export default async function NotificationsPage() {
  const items = await listNotificationsAction();

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold text-ink">Bildirimler</h1>
      <p className="mb-6 text-sm text-ink-soft">Hesabınıza gelen sistem bildirimleri.</p>
      <NotificationList initial={items} />
    </div>
  );
}
