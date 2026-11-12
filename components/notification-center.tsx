"use client";

import { useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { markInboxRead } from "@/lib/actions";

type Item = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: string;
};

export function NotificationCenter({
  items,
  unread,
}: {
  items: Item[];
  unread: number;
}) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  return (
    <div className="relative">
      <button
        type="button"
        className="relative rounded-full border border-line bg-paper p-2 text-ink"
        aria-label="Notifications"
        onClick={() => {
          setOpen((value) => !value);
          if (unread > 0) startTransition(() => markInboxRead());
        }}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rust px-1 text-[10px] text-paper">
            {unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-[min(90vw,22rem)] overflow-hidden rounded-2xl border border-line bg-paper shadow-xl">
          <div className="border-b border-line px-4 py-3">
            <p className="text-sm font-medium">Reminders</p>
            <p className="text-xs text-muted">
              Daily digest lands here when email is not configured.
            </p>
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted">No digest yet. Run one from Settings.</p>
          ) : (
            <ul className="max-h-80 overflow-auto">
              {items.map((item) => (
                <li key={item.id} className="border-b border-line px-4 py-3 last:border-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs leading-5 text-muted">{item.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
