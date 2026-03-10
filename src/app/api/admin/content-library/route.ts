import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const category = params.get("category") || "";
  const fileType = params.get("fileType") || "";
  const search = params.get("search") || "";

  const where: Record<string, unknown> = { isActive: true };
  if (category) where.category = category;
  if (fileType) where.fileType = fileType;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { tags: { contains: search } },
    ];
  }

  const items = await prisma.contentItem.findMany({
    where: where as Parameters<typeof prisma.contentItem.findMany>[0] extends { where?: infer W } ? W : never,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const item = await prisma.contentItem.create({
    data: {
      title: body.title,
      description: body.description || null,
      fileUrl: body.fileUrl,
      fileType: body.fileType,
      fileSize: body.fileSize || 0,
      tags: body.tags || null,
      category: body.category || null,
      accessPlans: body.accessPlans || "all",
      uploadedBy: session.user.email || "admin",
    },
  });

  return NextResponse.json({ item });
}
