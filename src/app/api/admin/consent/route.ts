import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const versions = await prisma.consentVersion.findMany({ orderBy: { publishedAt: "desc" } });
  const acceptances = await prisma.consentAcceptance.count();

  return NextResponse.json({ versions, totalAcceptances: acceptances });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { version, title, content } = await req.json();
  if (!version || !title || !content) {
    return NextResponse.json({ error: "version, title, content required" }, { status: 400 });
  }

  // Deactivate previous versions
  await prisma.consentVersion.updateMany({ data: { isActive: false } });

  const consent = await prisma.consentVersion.create({
    data: { version, title, content, isActive: true },
  });

  return NextResponse.json({ consent });
}
