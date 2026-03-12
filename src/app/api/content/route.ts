import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
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
