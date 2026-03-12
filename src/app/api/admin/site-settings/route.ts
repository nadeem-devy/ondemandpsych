import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) {
    const all = await prisma.siteSettings.findMany();
    return NextResponse.json(
      all.map((s) => ({ ...s, value: JSON.parse(s.value) }))
    );
  }

  const record = await prisma.siteSettings.findUnique({ where: { key } });
  if (!record) {
    return NextResponse.json({ key, value: null });
  }
  return NextResponse.json({ ...record, value: JSON.parse(record.value) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key, value } = await req.json();
  if (!key || value === undefined) {
    return NextResponse.json({ error: "Missing key or value" }, { status: 400 });
  }

  const record = await prisma.siteSettings.upsert({
    where: { key },
    update: { value: JSON.stringify(value) },
    create: { key, value: JSON.stringify(value) },
  });

  return NextResponse.json({ ...record, value: JSON.parse(record.value) });
}
