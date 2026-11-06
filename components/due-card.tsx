import Link from "next/link";
import { ChannelIcon } from "./channel-icon";
import { LogTouchDialog } from "./log-touch-dialog";
import { SnoozeMenu } from "./snooze-menu";
import { StatusBadge } from "./status-badge";
import { TagList } from "./tag-list";
import {
  classifyDue,
  formatRelativeDay,
  formatShortDate,
} from "@/lib/followup";
import type { ContactDTO } from "@/lib/dto";
import { cn } from "@/lib/cn";

export function DueCard({ contact }: { contact: ContactDTO }) {
  const next = contact.nextFollowUpAt ? new Date(contact.nextFollowUpAt) : null;
  const last = contact.lastTouchedAt ? new Date(contact.lastTouchedAt) : null;
  const bucket = classifyDue(next);
  const accent =
    bucket === "overdue"
      ? "border-l-rust"
      : bucket === "due_today"
        ? "border-l-gold"
        : "border-l-sage";

  return (
    <article className={cn("paper-card overflow-hidden border-l-[5px] p-5", accent)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={`/contacts/${contact.id}`} className="font-display text-xl hover:underline">
            {contact.name}
          </Link>
          <p className="text-sm text-muted">{contact.company ?? "Independent"}</p>
        </div>
        <StatusBadge status={contact.status} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
        {next ? (
          <span>
            Due {formatShortDate(next)} · {formatRelativeDay(next)}
          </span>
        ) : (
          <span>No follow-up date</span>
        )}
        {last ? (
          <span className="inline-flex items-center gap-1">
            Last{" "}
            <ChannelIcon
              channel={contact.lastTouch?.channel ?? contact.channel}
              withLabel
            />{" "}
            {formatRelativeDay(last).toLowerCase()}
          </span>
        ) : (
          <span>No touches yet</span>
        )}
      </div>
      {contact.lastTouch?.note ? (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink/80">
          {contact.lastTouch.note}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <TagList tags={contact.tags} />
        <div className="ml-auto flex gap-2">
          <SnoozeMenu contactId={contact.id} />
          <LogTouchDialog contact={contact} compact />
        </div>
      </div>
    </article>
  );
}
