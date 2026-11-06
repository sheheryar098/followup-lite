import { PrismaClient } from "@prisma/client";
import { DEMO_CONTACTS } from "./demo-data";
import { seedDemo } from "./load-demo";

const prisma = new PrismaClient();

async function main() {
  await seedDemo(prisma);
  console.log(`Seeded ${DEMO_CONTACTS.length} demo contacts.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
