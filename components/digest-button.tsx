"use client";

import { useState, useTransition } from "react";
import { sendDigestNow } from "@/lib/actions";

export function DigestButton() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        className="btn btn-accent"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await sendDigestNow();
            setMessage(
              result.emailed
                ? `Email digest sent · ${result.due} due`
                : `Saved in-app · ${result.due} due (email not configured)`,
            );
          })
        }
      >
        {pending ? "Sending…" : "Run digest now"}
      </button>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </div>
  );
}
