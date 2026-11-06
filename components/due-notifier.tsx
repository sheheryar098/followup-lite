"use client";

import { useEffect } from "react";

export function DueNotifier({
  dueCount,
  enabled,
}: {
  dueCount: number;
  enabled: boolean;
}) {
  useEffect(() => {
    if (!enabled || dueCount === 0 || typeof window === "undefined") return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const key = `followup-lite-notified-${new Date().toISOString().slice(0, 10)}`;
    if (window.localStorage.getItem(key)) return;

    const notification = new Notification("FollowUp Lite", {
      body:
        dueCount === 1
          ? "1 follow-up is waiting on you today."
          : `${dueCount} follow-ups are waiting on you today.`,
    });
    window.localStorage.setItem(key, "1");
    return () => notification.close();
  }, [dueCount, enabled]);

  return null;
}
