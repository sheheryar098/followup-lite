import { prisma } from "./prisma";
import {
  groupQueue,
  parseTags,
  type Channel,
  type Status,
} from "./followup";
import { toIso, type ContactDTO } from "./dto";

export async function getContacts(filters?: {
  q?: string;
  status?: Status | "";
  channel?: Channel | "";
  tag?: string;
}) {
  const contacts = await prisma.contact.findMany({
    include: {
      touches: { orderBy: { date: "desc" }, take: 1 },
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  const query = filters?.q?.trim().toLowerCase() ?? "";
  const tag = filters?.tag?.trim().toLowerCase() ?? "";

  return contacts.filter((contact) => {
    if (filters?.status && contact.status !== filters.status) return false;
    if (filters?.channel && contact.channel !== filters.channel) return false;
    if (tag && !parseTags(contact.tags).includes(tag)) return false;
    if (!query) return true;
    const haystack = [
      contact.name,
      contact.company ?? "",
      contact.email ?? "",
      contact.url ?? "",
      contact.tags,
      contact.notes,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  }).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getContact(id: string) {
  return prisma.contact.findUnique({
    where: { id },
    include: { touches: { orderBy: { date: "desc" } } },
  });
}

export async function getQueue() {
  const contacts = await prisma.contact.findMany({
    include: {
      touches: { orderBy: { date: "desc" }, take: 1 },
    },
  });
  return groupQueue(contacts);
}

export async function getAllTags() {
  const contacts = await prisma.contact.findMany({ select: { tags: true } });
  const tags = new Set<string>();
  for (const contact of contacts) {
    for (const tag of parseTags(contact.tags)) tags.add(tag);
  }
  return [...tags].sort();
}

export async function getStatusCounts() {
  const grouped = await prisma.contact.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  return Object.fromEntries(
    grouped.map((row) => [row.status, row._count._all]),
  ) as Partial<Record<Status, number>>;
}

export async function getSettings() {
  return (
    (await prisma.appSetting.findUnique({ where: { id: "default" } })) ??
    (await prisma.appSetting.create({ data: { id: "default" } }))
  );
}

export async function getInbox(limit = 12) {
  return prisma.inboxItem.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadInboxCount() {
  return prisma.inboxItem.count({ where: { read: false } });
}

export function toContactDTO(contact: {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  url: string | null;
  channel: Channel;
  status: Status;
  tags: string;
  notes: string;
  nextFollowUpAt: Date | null;
  lastTouchedAt: Date | null;
  touches: Array<{
    id: string;
    date: Date;
    channel: Channel;
    note: string;
  }>;
}): ContactDTO {
  const last = contact.touches[0];
  return {
    id: contact.id,
    name: contact.name,
    company: contact.company,
    email: contact.email,
    url: contact.url,
    channel: contact.channel,
    status: contact.status,
    tags: contact.tags,
    notes: contact.notes,
    nextFollowUpAt: toIso(contact.nextFollowUpAt),
    lastTouchedAt: toIso(contact.lastTouchedAt),
    lastTouch: last
      ? {
          id: last.id,
          date: last.date.toISOString(),
          channel: last.channel,
          note: last.note,
        }
      : null,
  };
}
