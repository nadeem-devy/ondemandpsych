import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");

  if (slug) {
    const page = await prisma.legalPage.findUnique({ where: { slug } });
    if (!page || !page.isActive) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(page);
  }

  const pages = await prisma.legalPage.findMany({
    where: { isActive: true },
    select: { id: true, title: true, slug: true, updatedAt: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(pages);
}
