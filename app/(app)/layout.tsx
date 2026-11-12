import { headers } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { getInbox, getQueue, getSettings, getUnreadInboxCount } from "@/lib/queries";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queue, inbox, unread, settings, headerList] = await Promise.all([
    getQueue(),
    getInbox(),
    getUnreadInboxCount(),
    getSettings(),
    headers(),
  ]);
  const pathname = headerList.get("x-pathname") || "/";
  const dueCount = queue.overdue.length + queue.dueToday.length;

  return (
    <AppShell
      pathname={pathname}
      dueCount={dueCount}
      inbox={inbox}
      unread={unread}
      notify={settings.browserNotifications}
    >
      {children}
    </AppShell>
  );
}
