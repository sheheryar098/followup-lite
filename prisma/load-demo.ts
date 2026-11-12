import { PrismaClient } from "@prisma/client";
import { DEMO_CONTACTS, materializeDemoContact } from "./demo-data";

export async function seedDemo(client: PrismaClient, now = new Date()) {
  await client.touch.deleteMany();
  await client.contact.deleteMany();
  await client.inboxItem.deleteMany();
  await client.appSetting.deleteMany();

  await client.appSetting.create({
    data: {
      id: "default",
      browserNotifications: true,
    },
  });

  for (const demo of DEMO_CONTACTS) {
    const contact = materializeDemoContact(demo, now);
    await client.contact.create({
      data: {
        name: contact.name,
        company: contact.company,
        email: contact.email,
        url: contact.url,
        channel: contact.channel,
        status: contact.status,
        tags: contact.tags,
        notes: contact.notes,
        nextFollowUpAt: contact.nextFollowUpAt,
        lastTouchedAt: contact.lastTouchedAt,
        touches: {
          create: contact.touches,
        },
      },
    });
  }
}
