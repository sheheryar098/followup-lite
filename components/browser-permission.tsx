"use client";

import { useState, useSyncExternalStore } from "react";

function getSnapshot(): NotificationPermission | "unsupported" {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

function subscribe() {
  return () => {};
}

export function BrowserPermission() {
  const live = useSyncExternalStore(subscribe, getSnapshot, () => "default" as const);
  const [requested, setRequested] = useState<NotificationPermission | null>(null);
  const permission = requested ?? live;

  if (permission === "unsupported") {
    return (
      <p className="text-sm text-muted">
        This browser does not support notifications. The in-app bell still works.
      </p>
    );
  }

  if (permission === "granted") {
    return (
      <p className="text-sm text-sage">
        Browser notifications are on. FollowUp Lite will nudge you once a day if anything is due.
      </p>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={async () => {
        if (!("Notification" in window)) return;
        setRequested(await Notification.requestPermission());
      }}
    >
      Enable browser notifications
    </button>
  );
}
