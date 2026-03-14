import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pages = await prisma.legalPage.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ pages });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, slug, content } = await req.json();
  if (!title || !slug || !content) {
    return NextResponse.json({ error: "title, slug, and content are required" }, { status: 400 });
  }

  const page = await prisma.legalPage.create({
    data: { title, slug, content },
  });

  return NextResponse.json({ page });
}
