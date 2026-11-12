import { prisma } from "./prisma";
import {
  buildDigestItems,
  renderDigestHtml,
  renderDigestSubject,
  renderDigestText,
  renderInboxCopy,
  selectProvider,
  type ReminderProvider,
} from "./reminders";

export type DigestResult = {
  provider: ReminderProvider;
  due: number;
  upcoming: number;
  emailed: boolean;
};

export async function runDigest(now = new Date()): Promise<DigestResult> {
  const [contacts, settings] = await Promise.all([
    prisma.contact.findMany(),
    prisma.appSetting.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    }),
  ]);

  const items = buildDigestItems(contacts, now);
  const due = items.filter((item) => item.bucket !== "upcoming").length;
  const upcoming = items.length - due;
  const digestTo = process.env.DIGEST_TO?.trim() || settings.digestEmail || "";
  const provider = selectProvider({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    DIGEST_TO: digestTo,
  });

  const inbox = renderInboxCopy(items);
  await prisma.inboxItem.create({
    data: {
      title: inbox.title,
      body: inbox.body,
      href: "/",
    },
  });

  let emailed = false;
  if (provider === "resend") {
    emailed = await sendResendEmail({
      to: digestTo,
      subject: renderDigestSubject(items, now),
      html: renderDigestHtml(items, now),
      text: renderDigestText(items, now),
    });
  }

  await prisma.appSetting.update({
    where: { id: "default" },
    data: {
      lastDigestAt: now,
      lastDigestProvider: emailed ? "resend" : "in-app",
      digestEmail: settings.digestEmail || digestTo || null,
    },
  });

  return { provider: emailed ? "resend" : "in-app", due, upcoming, emailed };
}

async function sendResendEmail(args: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const from =
    process.env.DIGEST_FROM?.trim() || "FollowUp Lite <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [args.to],
      subject: args.subject,
      html: args.html,
      text: args.text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Resend digest failed", response.status, detail);
    return false;
  }

  return true;
}
