import { NextResponse } from "next/server";
import { contactsToCsv } from "@/lib/csv";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const contacts = await prisma.contact.findMany({
    orderBy: { name: "asc" },
  });
  const csv = contactsToCsv(contacts);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="followup-lite.csv"',
    },
  });
}
