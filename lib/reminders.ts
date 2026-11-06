import {
  CHANNEL_LABELS,
  classifyDue,
  daysFromToday,
  formatRelativeDay,
  formatShortDate,
  isOpenStatus,
  type Channel,
  type Status,
} from "./followup";

export type DigestContact = {
  name: string;
  company: string | null;
  channel: Channel;
  status: Status;
  nextFollowUpAt: Date | null;
  lastTouchedAt: Date | null;
};

export type DigestItem = {
  name: string;
  company: string | null;
  channel: Channel;
  bucket: "overdue" | "due_today" | "upcoming";
  nextFollowUpAt: Date;
  lastTouchedAt: Date | null;
  days: number;
};

export type ReminderProvider = "resend" | "in-app";

export function selectProvider(env: {
  RESEND_API_KEY?: string | undefined;
  DIGEST_TO?: string | undefined;
}): ReminderProvider {
  if (env.RESEND_API_KEY?.trim() && env.DIGEST_TO?.trim()) return "resend";
  return "in-app";
}

export function buildDigestItems(
  contacts: DigestContact[],
  now = new Date(),
  upcomingHorizonDays = 7,
): DigestItem[] {
  const items: DigestItem[] = [];

  for (const contact of contacts) {
    if (!isOpenStatus(contact.status) || !contact.nextFollowUpAt) continue;
    const bucket = classifyDue(contact.nextFollowUpAt, now);
    if (bucket === "unscheduled") continue;
    const days = daysFromToday(contact.nextFollowUpAt, now);
    if (bucket === "upcoming" && days > upcomingHorizonDays) continue;
    items.push({
      name: contact.name,
      company: contact.company,
      channel: contact.channel,
      bucket,
      nextFollowUpAt: contact.nextFollowUpAt,
      lastTouchedAt: contact.lastTouchedAt,
      days,
    });
  }

  const rank = { overdue: 0, due_today: 1, upcoming: 2 };
  items.sort((a, b) => {
    if (rank[a.bucket] !== rank[b.bucket]) return rank[a.bucket] - rank[b.bucket];
    return a.nextFollowUpAt.getTime() - b.nextFollowUpAt.getTime();
  });

  return items;
}

export function dueCount(items: DigestItem[]): number {
  return items.filter((item) => item.bucket !== "upcoming").length;
}

export function renderDigestSubject(items: DigestItem[], now = new Date()): string {
  const due = dueCount(items);
  const label = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (due === 0) return `FollowUp Lite — nothing due ${label}`;
  return `FollowUp Lite — ${due} follow-up${due === 1 ? "" : "s"} due ${label}`;
}

export function renderDigestText(items: DigestItem[], now = new Date()): string {
  const due = items.filter((item) => item.bucket !== "upcoming");
  const upcoming = items.filter((item) => item.bucket === "upcoming");
  const lines = [
    `FollowUp Lite digest · ${now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`,
    "",
  ];

  if (due.length === 0) {
    lines.push("Nobody is waiting on you today. Nice.");
  } else {
    lines.push("Due now");
    for (const item of due) {
      lines.push(`- ${formatItemLine(item)}`);
    }
  }

  if (upcoming.length > 0) {
    lines.push("", "Coming up");
    for (const item of upcoming) {
      lines.push(`- ${formatItemLine(item)}`);
    }
  }

  lines.push("", "Open your queue: /");
  return lines.join("\n");
}

export function renderDigestHtml(items: DigestItem[], now = new Date()): string {
  const due = items.filter((item) => item.bucket !== "upcoming");
  const upcoming = items.filter((item) => item.bucket === "upcoming");
  const heading = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const row = (item: DigestItem) => {
    const company = item.company ? ` · ${escapeHtml(item.company)}` : "";
    const last = item.lastTouchedAt
      ? `Last touch ${escapeHtml(formatRelativeDay(item.lastTouchedAt, now).toLowerCase())}`
      : "No touches yet";
    return `<tr>
      <td style="padding:12px 0;border-bottom:1px solid #E4D9C8;">
        <div style="font-weight:600;color:#1C1612;">${escapeHtml(item.name)}${company}</div>
        <div style="color:#5C534A;font-size:13px;margin-top:4px;">
          ${escapeHtml(CHANNEL_LABELS[item.channel])} · ${escapeHtml(formatShortDate(item.nextFollowUpAt))} (${escapeHtml(formatRelativeDay(item.nextFollowUpAt, now))}) · ${last}
        </div>
      </td>
    </tr>`;
  };

  const section = (title: string, list: DigestItem[]) => {
    if (list.length === 0) return "";
    return `<h2 style="font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#C24A1A;margin:28px 0 8px;">${title}</h2>
      <table width="100%" cellpadding="0" cellspacing="0">${list.map(row).join("")}</table>`;
  };

  const empty =
    due.length === 0
      ? `<p style="color:#5C534A;">Nobody is waiting on you today. Nice.</p>`
      : "";

  return `<!doctype html>
<html>
  <body style="margin:0;background:#F3EEE4;font-family:Georgia,serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
      <p style="margin:0 0 4px;color:#C24A1A;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;">FollowUp Lite</p>
      <h1 style="font-size:28px;line-height:1.2;color:#1C1612;margin:0 0 8px;">Daily digest</h1>
      <p style="color:#5C534A;margin:0 0 24px;">${escapeHtml(heading)}</p>
      ${empty}
      ${section("Overdue & due today", due)}
      ${section("Coming up this week", upcoming)}
    </div>
  </body>
</html>`;
}

export function renderInboxCopy(items: DigestItem[]): { title: string; body: string } {
  const due = dueCount(items);
  if (due === 0) {
    return {
      title: "Nothing due today",
      body: "Your follow-up queue is clear. Upcoming outreach is still listed in the app.",
    };
  }
  const names = items
    .filter((item) => item.bucket !== "upcoming")
    .slice(0, 3)
    .map((item) => item.name);
  const extra = due > names.length ? ` +${due - names.length} more` : "";
  return {
    title: `${due} follow-up${due === 1 ? "" : "s"} due`,
    body: `${names.join(", ")}${extra}`,
  };
}

function formatItemLine(item: DigestItem): string {
  const company = item.company ? ` (${item.company})` : "";
  return `${item.name}${company} · ${CHANNEL_LABELS[item.channel]} · ${formatRelativeDay(item.nextFollowUpAt)}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
