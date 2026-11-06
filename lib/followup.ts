export const CHANNELS = [
  "EMAIL",
  "LINKEDIN",
  "FORM",
  "PHONE",
  "OTHER",
] as const;
export type Channel = (typeof CHANNELS)[number];

export const STATUSES = [
  "NEW",
  "CONTACTED",
  "REPLIED",
  "WON",
  "LOST",
] as const;
export type Status = (typeof STATUSES)[number];

export const OPEN_STATUSES: Status[] = ["NEW", "CONTACTED", "REPLIED"];

export const CHANNEL_LABELS: Record<Channel, string> = {
  EMAIL: "Email",
  LINKEDIN: "LinkedIn",
  FORM: "Form",
  PHONE: "Phone",
  OTHER: "Other",
};

export const STATUS_LABELS: Record<Status, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  REPLIED: "Replied",
  WON: "Won",
  LOST: "Lost",
};

export const FOLLOW_UP_PRESETS = [
  { id: "3d", label: "+3d", days: 3 },
  { id: "1w", label: "+1w", days: 7 },
  { id: "2w", label: "+2w", days: 14 },
] as const;

export const SNOOZE_PRESETS = [
  { id: "1d", label: "+1d", days: 1 },
  { id: "3d", label: "+3d", days: 3 },
  { id: "1w", label: "+1w", days: 7 },
  { id: "2w", label: "+2w", days: 14 },
] as const;

export type DueBucket = "overdue" | "due_today" | "upcoming" | "unscheduled";

export type NextFollowUpInput =
  | { type: "keep" }
  | { type: "clear" }
  | { type: "in_days"; days: number }
  | { type: "on_date"; date: Date };

const MS_PER_DAY = 86_400_000;

export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function daysFromToday(date: Date, now = new Date()): number {
  return Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / MS_PER_DAY,
  );
}

export function isOpenStatus(status: Status): boolean {
  return OPEN_STATUSES.includes(status);
}

export function classifyDue(
  nextFollowUpAt: Date | null | undefined,
  now = new Date(),
): DueBucket {
  if (!nextFollowUpAt) return "unscheduled";
  const dueDay = startOfDay(nextFollowUpAt).getTime();
  const today = startOfDay(now).getTime();
  if (dueDay < today) return "overdue";
  if (dueDay === today) return "due_today";
  return "upcoming";
}

export function resolveNextFollowUp(
  current: Date | null,
  input: NextFollowUpInput,
  now = new Date(),
): Date | null {
  switch (input.type) {
    case "keep":
      return current;
    case "clear":
      return null;
    case "in_days":
      return startOfDay(addDays(now, input.days));
    case "on_date":
      return startOfDay(input.date);
  }
}

export function applyLogTouch(args: {
  currentStatus: Status;
  touchDate: Date;
  nextFollowUp: NextFollowUpInput;
  currentNextFollowUpAt?: Date | null;
  now?: Date;
}): {
  status: Status;
  lastTouchedAt: Date;
  nextFollowUpAt: Date | null;
} {
  const now = args.now ?? new Date();
  const status: Status =
    args.currentStatus === "NEW" ? "CONTACTED" : args.currentStatus;
  return {
    status,
    lastTouchedAt: args.touchDate,
    nextFollowUpAt: resolveNextFollowUp(
      args.currentNextFollowUpAt ?? null,
      args.nextFollowUp,
      now,
    ),
  };
}

export function applySnooze(now: Date, days: number): Date {
  if (!Number.isFinite(days) || days <= 0) {
    throw new Error("Snooze days must be a positive number");
  }
  return startOfDay(addDays(now, days));
}

export function shouldClearFollowUp(status: Status): boolean {
  return status === "WON" || status === "LOST";
}

export type QueueItem = {
  nextFollowUpAt: Date | null;
  status: Status;
};

export function groupQueue<T extends QueueItem>(items: T[], now = new Date()) {
  const overdue: T[] = [];
  const dueToday: T[] = [];
  const upcoming: T[] = [];
  const unscheduled: T[] = [];

  for (const item of items) {
    if (!isOpenStatus(item.status)) continue;
    const bucket = classifyDue(item.nextFollowUpAt, now);
    if (bucket === "overdue") overdue.push(item);
    else if (bucket === "due_today") dueToday.push(item);
    else if (bucket === "upcoming") upcoming.push(item);
    else unscheduled.push(item);
  }

  const byDate = (a: T, b: T) =>
    (a.nextFollowUpAt?.getTime() ?? 0) - (b.nextFollowUpAt?.getTime() ?? 0);

  overdue.sort(byDate);
  dueToday.sort(byDate);
  upcoming.sort(byDate);

  return { overdue, dueToday, upcoming, unscheduled };
}

export function formatRelativeDay(date: Date, now = new Date()): string {
  const diff = daysFromToday(date, now);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  return `in ${diff} days`;
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function toDateInputValue(date: Date): string {
  const local = startOfDay(date);
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, "0");
  const day = String(local.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateInput(value: string): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return null;
  return startOfDay(date);
}

export function parseTags(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .filter((tag, index, all) => all.indexOf(tag) === index);
}

export function serializeTags(tags: string[] | string): string {
  const list = parseTags(Array.isArray(tags) ? tags.join(",") : tags);
  return list.join(", ");
}

export function parseChannel(value: string | null | undefined): Channel | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase().replace(/\s+/g, "");
  if (normalized === "LINKEDIN") return "LINKEDIN";
  if ((CHANNELS as readonly string[]).includes(normalized)) {
    return normalized as Channel;
  }
  const labels = Object.entries(CHANNEL_LABELS).find(
    ([, label]) => label.toLowerCase() === value.trim().toLowerCase(),
  );
  return (labels?.[0] as Channel | undefined) ?? null;
}

export function parseStatus(value: string | null | undefined): Status | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  if ((STATUSES as readonly string[]).includes(normalized)) {
    return normalized as Status;
  }
  const labels = Object.entries(STATUS_LABELS).find(
    ([, label]) => label.toLowerCase() === value.trim().toLowerCase(),
  );
  return (labels?.[0] as Status | undefined) ?? null;
}
