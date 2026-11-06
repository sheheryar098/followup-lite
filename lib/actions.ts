"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import {
  applyLogTouch,
  applySnooze,
  parseChannel,
  parseDateInput,
  parseStatus,
  serializeTags,
  shouldClearFollowUp,
  type Channel,
  type NextFollowUpInput,
  type Status,
} from "./followup";
import { contactsFromCsv } from "./csv";
import { isAuthEnabled, SESSION_COOKIE, sessionToken, verifyPassword } from "./auth";
import { seedDemo } from "../prisma/load-demo";
import { runDigest } from "./digest";

function emptyToNull(value: FormDataEntryValue | null): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  return text ? text : null;
}

function revalidateAll() {
  revalidatePath("/", "layout");
}

function nextFollowUpFromForm(formData: FormData): NextFollowUpInput {
  const preset = String(formData.get("followUpPreset") ?? "keep");
  if (preset === "clear") return { type: "clear" };
  if (preset === "3" || preset === "7" || preset === "14") {
    return { type: "in_days", days: Number(preset) };
  }
  const date = parseDateInput(String(formData.get("nextFollowUpAt") ?? ""));
  if (date) return { type: "on_date", date };
  return { type: "keep" };
}

export async function createContact(formData: FormData) {
  const name = emptyToNull(formData.get("name"));
  if (!name) throw new Error("Name is required");
  const status = parseStatus(String(formData.get("status") ?? "NEW")) ?? "NEW";
  const channel = parseChannel(String(formData.get("channel") ?? "EMAIL")) ?? "EMAIL";
  const nextFollowUpAt = shouldClearFollowUp(status)
    ? null
    : parseDateInput(String(formData.get("nextFollowUpAt") ?? ""));

  const created = await prisma.contact.create({
    data: {
      name,
      company: emptyToNull(formData.get("company")),
      email: emptyToNull(formData.get("email")),
      url: emptyToNull(formData.get("url")),
      channel,
      status,
      tags: serializeTags(String(formData.get("tags") ?? "")),
      notes: String(formData.get("notes") ?? "").trim(),
      nextFollowUpAt,
    },
  });

  revalidateAll();
  redirect(`/contacts/${created.id}`);
}

export async function updateContact(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = emptyToNull(formData.get("name"));
  if (!id || !name) throw new Error("Name is required");
  const status = parseStatus(String(formData.get("status") ?? "NEW")) ?? "NEW";
  const channel = parseChannel(String(formData.get("channel") ?? "EMAIL")) ?? "EMAIL";
  const nextFollowUpAt = shouldClearFollowUp(status)
    ? null
    : parseDateInput(String(formData.get("nextFollowUpAt") ?? ""));

  await prisma.contact.update({
    where: { id },
    data: {
      name,
      company: emptyToNull(formData.get("company")),
      email: emptyToNull(formData.get("email")),
      url: emptyToNull(formData.get("url")),
      channel,
      status,
      tags: serializeTags(String(formData.get("tags") ?? "")),
      notes: String(formData.get("notes") ?? "").trim(),
      nextFollowUpAt,
    },
  });

  revalidateAll();
  redirect(`/contacts/${id}`);
}

export async function deleteContact(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.contact.delete({ where: { id } });
  revalidateAll();
  redirect("/contacts");
}

export async function logTouch(formData: FormData) {
  const contactId = String(formData.get("contactId") ?? "");
  const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!contact) throw new Error("Contact not found");

  const channel =
    parseChannel(String(formData.get("channel") ?? contact.channel)) ??
    contact.channel;
  const touchDate =
    parseDateInput(String(formData.get("date") ?? "")) ?? new Date();
  const note = String(formData.get("note") ?? "").trim();
  const nextFollowUp = nextFollowUpFromForm(formData);
  const patch = applyLogTouch({
    currentStatus: contact.status,
    currentNextFollowUpAt: contact.nextFollowUpAt,
    touchDate,
    nextFollowUp,
  });

  await prisma.$transaction([
    prisma.touch.create({
      data: { contactId, date: touchDate, channel, note },
    }),
    prisma.contact.update({
      where: { id: contactId },
      data: {
        status: patch.status,
        lastTouchedAt: patch.lastTouchedAt,
        nextFollowUpAt: patch.nextFollowUpAt,
        channel,
      },
    }),
  ]);

  revalidateAll();
}

export async function snoozeContact(contactId: string, days: number) {
  const nextFollowUpAt = applySnooze(new Date(), days);
  await prisma.contact.update({
    where: { id: contactId },
    data: { nextFollowUpAt },
  });
  revalidateAll();
}

export async function importContacts(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { created: 0, errors: [{ row: 0, message: "Choose a CSV file" }] };
  }
  const text = await file.text();
  const parsed = contactsFromCsv(text);
  if (parsed.contacts.length === 0) {
    return { created: 0, errors: parsed.errors };
  }

  await prisma.contact.createMany({
    data: parsed.contacts.map((contact) => ({
      name: contact.name,
      company: contact.company || null,
      email: contact.email || null,
      url: contact.url || null,
      channel: contact.channel,
      status: contact.status,
      tags: contact.tags,
      notes: contact.notes,
      nextFollowUpAt: contact.nextFollowUpAt,
      lastTouchedAt: contact.lastTouchedAt,
    })),
  });

  revalidateAll();
  return { created: parsed.contacts.length, errors: parsed.errors };
}

export async function saveSettings(formData: FormData) {
  const digestEmail = emptyToNull(formData.get("digestEmail"));
  const browserNotifications = formData.get("browserNotifications") === "on";
  await prisma.appSetting.upsert({
    where: { id: "default" },
    update: { digestEmail, browserNotifications },
    create: { id: "default", digestEmail, browserNotifications },
  });
  revalidateAll();
}

export async function sendDigestNow() {
  const result = await runDigest();
  revalidateAll();
  return result;
}

export async function markInboxRead() {
  await prisma.inboxItem.updateMany({ data: { read: true } });
  revalidateAll();
}

export async function reloadDemoData() {
  await seedDemo(prisma);
  revalidateAll();
}

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(password)) {
    redirect("/login?error=1");
  }
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/");
}

export async function logout() {
  if (!isAuthEnabled()) return;
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}

export async function updateStatus(contactId: string, status: Status) {
  await prisma.contact.update({
    where: { id: contactId },
    data: {
      status,
      nextFollowUpAt: shouldClearFollowUp(status) ? null : undefined,
    },
  });
  revalidateAll();
}

export async function setFollowUpDate(contactId: string, days: number) {
  await prisma.contact.update({
    where: { id: contactId },
    data: { nextFollowUpAt: applySnooze(new Date(), days) },
  });
  revalidateAll();
}

export type { Channel, Status };
