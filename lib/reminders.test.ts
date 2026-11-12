import { describe, expect, it } from "vitest";
import {
  buildDigestItems,
  dueCount,
  renderDigestSubject,
  renderInboxCopy,
  selectProvider,
} from "./reminders";

const now = new Date(2026, 10, 6, 9, 0, 0);

const contacts = [
  {
    name: "Maya Chen",
    company: "Lattice",
    channel: "LINKEDIN" as const,
    status: "CONTACTED" as const,
    nextFollowUpAt: new Date(2026, 10, 3),
    lastTouchedAt: new Date(2026, 10, 1),
  },
  {
    name: "Owen Blake",
    company: "Northwind Labs",
    channel: "EMAIL" as const,
    status: "CONTACTED" as const,
    nextFollowUpAt: new Date(2026, 10, 6),
    lastTouchedAt: new Date(2026, 10, 4),
  },
  {
    name: "Priya Shah",
    company: "Harbor & Co",
    channel: "FORM" as const,
    status: "REPLIED" as const,
    nextFollowUpAt: new Date(2026, 10, 8),
    lastTouchedAt: new Date(2026, 10, 5),
  },
  {
    name: "Elena Voss",
    company: "Kite Studio",
    channel: "EMAIL" as const,
    status: "WON" as const,
    nextFollowUpAt: new Date(2026, 10, 6),
    lastTouchedAt: new Date(2026, 10, 3),
  },
  {
    name: "Far out",
    company: null,
    channel: "PHONE" as const,
    status: "NEW" as const,
    nextFollowUpAt: new Date(2026, 10, 20),
    lastTouchedAt: null,
  },
];

describe("digest builder", () => {
  it("includes overdue and due today, plus upcoming within the horizon", () => {
    const items = buildDigestItems(contacts, now, 7);
    expect(items.map((item) => item.name)).toEqual([
      "Maya Chen",
      "Owen Blake",
      "Priya Shah",
    ]);
    expect(dueCount(items)).toBe(2);
    expect(renderDigestSubject(items, now)).toBe(
      "FollowUp Lite — 2 follow-ups due Nov 6",
    );
  });

  it("excludes won deals and far-future follow-ups", () => {
    const items = buildDigestItems(contacts, now, 7);
    expect(items.some((item) => item.name === "Elena Voss")).toBe(false);
    expect(items.some((item) => item.name === "Far out")).toBe(false);
  });

  it("writes a calm empty subject when the queue is clear", () => {
    const items = buildDigestItems(
      contacts.filter((contact) => contact.status === "WON"),
      now,
    );
    expect(renderDigestSubject(items, now)).toBe(
      "FollowUp Lite — nothing due Nov 6",
    );
    expect(renderInboxCopy(items).title).toBe("Nothing due today");
  });
});

describe("provider selection", () => {
  it("uses Resend only when both an API key and a recipient exist", () => {
    expect(selectProvider({})).toBe("in-app");
    expect(selectProvider({ RESEND_API_KEY: "re_test" })).toBe("in-app");
    expect(selectProvider({ DIGEST_TO: "you@example.com" })).toBe("in-app");
    expect(
      selectProvider({
        RESEND_API_KEY: "re_test",
        DIGEST_TO: "you@example.com",
      }),
    ).toBe("resend");
  });
});
