"use client";

import { useTransition } from "react";
import { reloadDemoData } from "@/lib/actions";

export function DemoButton({ label = "Reload demo data" }: { label?: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="btn btn-secondary"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          if (!confirm("Replace all contacts with the demo pipeline?")) return;
          await reloadDemoData();
        })
      }
    >
      {pending ? "Loading…" : label}
    </button>
  );
}
