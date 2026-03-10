import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await prisma.emailTemplate.findMany({ orderBy: { slug: "asc" } });
  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const template = await prisma.emailTemplate.create({
    data: {
      slug: body.slug,
      name: body.name,
      subject: body.subject,
      body: body.body,
    },
  });

  return NextResponse.json({ template });
}
