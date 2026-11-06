import { cn } from "@/lib/cn";
import { STATUS_LABELS, type Status } from "@/lib/followup";

const styles: Record<Status, string> = {
  NEW: "bg-line/70 text-muted",
  CONTACTED: "bg-gold-soft text-gold",
  REPLIED: "bg-sage-soft text-sage",
  WON: "bg-ink text-paper",
  LOST: "bg-rose-soft text-rose",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        styles[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
