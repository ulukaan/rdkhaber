import { auth } from "@/auth";
import { getRecentNotificationsAction, getUnreadNotificationCountAction } from "@/actions/notifications";
import { NotificationBell } from "@/components/layout/NotificationBell";

export async function NotificationBellServer() {
  const session = await auth();
  if (!session?.user) return null;

  const [count, items] = await Promise.all([
    getUnreadNotificationCountAction(),
    getRecentNotificationsAction(6),
  ]);

  return <NotificationBell initialCount={count} initialItems={items} />;
}
