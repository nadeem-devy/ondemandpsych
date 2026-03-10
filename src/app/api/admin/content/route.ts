import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pageSlug = req.nextUrl.searchParams.get("page");
  if (!pageSlug) {
    return NextResponse.json({ error: "Missing page parameter" }, { status: 400 });
  }

  const sections = await prisma.pageContent.findMany({
    where: { pageSlug },
    orderBy: { sectionId: "asc" },
  });

  const parsed = sections.map((s) => ({
    ...s,
    content: JSON.parse(s.content),
  }));

  return NextResponse.json(parsed);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pageSlug, sectionId, content } = await req.json();

  if (!pageSlug || !sectionId || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const record = await prisma.pageContent.upsert({
    where: { pageSlug_sectionId: { pageSlug, sectionId } },
    update: { content: JSON.stringify(content) },
    create: { pageSlug, sectionId, content: JSON.stringify(content) },
  });

  return NextResponse.json(record);
}
