import { describe, expect, it } from "vitest";
import {
  applyLogTouch,
  applySnooze,
  classifyDue,
  daysFromToday,
  formatRelativeDay,
  groupQueue,
  parseChannel,
  parseStatus,
  parseTags,
  resolveNextFollowUp,
  serializeTags,
  startOfDay,
} from "./followup";

const now = new Date(2026, 10, 6, 15, 30, 0);

describe("classifyDue", () => {
  it("treats calendar days, not 24-hour windows", () => {
    const lateTonight = new Date(2026, 10, 6, 23, 0, 0);
    const earlyYesterday = new Date(2026, 10, 5, 1, 0, 0);
    expect(classifyDue(lateTonight, now)).toBe("due_today");
    expect(classifyDue(earlyYesterday, now)).toBe("overdue");
  });

  it("marks tomorrow as upcoming and missing dates as unscheduled", () => {
    expect(classifyDue(new Date(2026, 10, 7), now)).toBe("upcoming");
    expect(classifyDue(null, now)).toBe("unscheduled");
  });
});

describe("applyLogTouch", () => {
  it("promotes New contacts to Contacted and sets the next follow-up from today", () => {
    const result = applyLogTouch({
      currentStatus: "NEW",
      touchDate: new Date(2026, 10, 6, 9, 0, 0),
      nextFollowUp: { type: "in_days", days: 3 },
      now,
    });
    expect(result.status).toBe("CONTACTED");
    expect(result.lastTouchedAt).toEqual(new Date(2026, 10, 6, 9, 0, 0));
    expect(result.nextFollowUpAt).toEqual(startOfDay(new Date(2026, 10, 9)));
  });

  it("does not demote Replied contacts", () => {
    const result = applyLogTouch({
      currentStatus: "REPLIED",
      touchDate: now,
      nextFollowUp: { type: "in_days", days: 7 },
      now,
    });
    expect(result.status).toBe("REPLIED");
    expect(daysFromToday(result.nextFollowUpAt!, now)).toBe(7);
  });

  it("can clear or set an explicit next follow-up date", () => {
    expect(
      applyLogTouch({
        currentStatus: "CONTACTED",
        touchDate: now,
        nextFollowUp: { type: "clear" },
        now,
      }).nextFollowUpAt,
    ).toBeNull();

    expect(
      applyLogTouch({
        currentStatus: "CONTACTED",
        touchDate: now,
        nextFollowUp: { type: "on_date", date: new Date(2026, 11, 1) },
        now,
      }).nextFollowUpAt,
    ).toEqual(startOfDay(new Date(2026, 11, 1)));
  });
});

describe("snooze and presets", () => {
  it("snoozes from today, not from the original due date", () => {
    expect(applySnooze(now, 3)).toEqual(startOfDay(new Date(2026, 10, 9)));
    expect(applySnooze(now, 7)).toEqual(startOfDay(new Date(2026, 10, 13)));
    expect(applySnooze(now, 14)).toEqual(startOfDay(new Date(2026, 10, 20)));
  });

  it("rejects non-positive snooze windows", () => {
    expect(() => applySnooze(now, 0)).toThrow();
    expect(() => applySnooze(now, -2)).toThrow();
  });

  it("keeps an existing date when asked", () => {
    const current = startOfDay(new Date(2026, 10, 8));
    expect(resolveNextFollowUp(current, { type: "keep" }, now)).toEqual(current);
  });
});

describe("groupQueue", () => {
  it("hides won/lost contacts and sorts overdue oldest first", () => {
    const queue = groupQueue(
      [
        { name: "Won", status: "WON" as const, nextFollowUpAt: now },
        { name: "Lost", status: "LOST" as const, nextFollowUpAt: now },
        {
          name: "Old overdue",
          status: "CONTACTED" as const,
          nextFollowUpAt: new Date(2026, 10, 1),
        },
        {
          name: "Fresh overdue",
          status: "CONTACTED" as const,
          nextFollowUpAt: new Date(2026, 10, 5),
        },
        {
          name: "Today",
          status: "REPLIED" as const,
          nextFollowUpAt: new Date(2026, 10, 6),
        },
        {
          name: "Later",
          status: "NEW" as const,
          nextFollowUpAt: new Date(2026, 10, 12),
        },
        { name: "No date", status: "NEW" as const, nextFollowUpAt: null },
      ],
      now,
    );

    expect(queue.overdue.map((item) => item.name)).toEqual([
      "Old overdue",
      "Fresh overdue",
    ]);
    expect(queue.dueToday.map((item) => item.name)).toEqual(["Today"]);
    expect(queue.upcoming.map((item) => item.name)).toEqual(["Later"]);
    expect(queue.unscheduled.map((item) => item.name)).toEqual(["No date"]);
  });
});

describe("labels and tags", () => {
  it("parses friendly channel and status labels", () => {
    expect(parseChannel("LinkedIn")).toBe("LINKEDIN");
    expect(parseChannel("email")).toBe("EMAIL");
    expect(parseStatus("Replied")).toBe("REPLIED");
    expect(parseStatus("won")).toBe("WON");
  });

  it("normalizes tags", () => {
    expect(parseTags("Warm, SaaS, warm, ")).toEqual(["warm", "saas"]);
    expect(serializeTags(["Warm", "saas"])).toBe("warm, saas");
  });

  it("formats relative days", () => {
    expect(formatRelativeDay(now, now)).toBe("Today");
    expect(formatRelativeDay(new Date(2026, 10, 5), now)).toBe("Yesterday");
    expect(formatRelativeDay(new Date(2026, 10, 9), now)).toBe("in 3 days");
  });
});
