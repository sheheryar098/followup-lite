"use client";

import { useTransition } from "react";
import { Clock } from "lucide-react";
import { snoozeContact } from "@/lib/actions";
import { SNOOZE_PRESETS } from "@/lib/followup";

export function SnoozeMenu({ contactId }: { contactId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <details className="menu relative">
      <summary className="btn btn-secondary">
        <Clock className="h-3.5 w-3.5" />
        Snooze
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-36 overflow-hidden rounded-2xl border border-line bg-paper py-1 shadow-lg">
        {SNOOZE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            disabled={pending}
            className="block w-full px-3 py-2 text-left text-sm hover:bg-cream"
            onClick={() =>
              startTransition(async () => {
                await snoozeContact(contactId, preset.days);
              })
            }
          >
            {preset.label}
          </button>
        ))}
      </div>
    </details>
  );
}
