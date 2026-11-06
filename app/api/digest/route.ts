import { NextResponse } from "next/server";
import { runDigest } from "@/lib/digest";

async function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!(await authorized(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await runDigest();
  return NextResponse.json(result);
}

export async function GET(request: Request) {
  return POST(request);
}
