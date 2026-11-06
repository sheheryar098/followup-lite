import Link from "next/link";
import { Inbox, Settings, Users, Download } from "lucide-react";
import { Logo } from "./logo";
import { NotificationCenter } from "./notification-center";
import { DueNotifier } from "./due-notifier";
import { cn } from "@/lib/cn";
import { isAuthEnabled } from "@/lib/auth";
import { logout } from "@/lib/actions";

const nav = [
  { href: "/", label: "Due", icon: Inbox },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/import", label: "Import", icon: Download },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({
  children,
  pathname,
  dueCount,
  inbox,
  unread,
  notify,
}: {
  children: React.ReactNode;
  pathname: string;
  dueCount: number;
  inbox: Array<{
    id: string;
    title: string;
    body: string;
    href: string | null;
    read: boolean;
    createdAt: Date;
  }>;
  unread: number;
  notify: boolean;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16.5rem_1fr]">
      <DueNotifier dueCount={dueCount} enabled={notify} />
      <aside className="border-b border-line bg-paper lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col px-5 py-5">
          <Logo />
          <p className="mt-5 max-w-[14rem] text-sm leading-6 text-muted">
            The anti-CRM. Follow up, don&apos;t forget.
          </p>
          <nav className="mt-8 flex gap-2 overflow-x-auto lg:flex-col">
            {nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-2 text-sm",
                    active ? "bg-ink text-paper" : "text-muted hover:bg-cream",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.href === "/" && dueCount > 0 ? (
                    <span
                      className={cn(
                        "ml-auto rounded-full px-1.5 text-[11px]",
                        active ? "bg-paper/15" : "bg-rust-soft text-rust",
                      )}
                    >
                      {dueCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto hidden pt-8 text-xs leading-5 text-muted lg:block">
            Local-first. No HubSpot. No pipeline theater.
            {isAuthEnabled() ? (
              <form action={logout} className="mt-4">
                <button type="submit" className="btn btn-ghost px-0">
                  Sign out
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-10 flex items-center justify-end gap-3 border-b border-line bg-cream/80 px-4 py-3 backdrop-blur md:px-8">
          <NotificationCenter
            unread={unread}
            items={inbox.map((item) => ({
              ...item,
              createdAt: item.createdAt.toISOString(),
            }))}
          />
          <Link href="/contacts/new" className="btn btn-primary">
            New contact
          </Link>
        </header>
        <main className="px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
