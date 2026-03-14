import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const faqs = await prisma.fAQ.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ faqs });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { question, answer, category } = await req.json();
  if (!question || !answer) {
    return NextResponse.json({ error: "question and answer are required" }, { status: 400 });
  }

  const maxOrder = await prisma.fAQ.aggregate({ _max: { sortOrder: true } });
  const faq = await prisma.fAQ.create({
    data: { question, answer, category: category || "General", sortOrder: (maxOrder._max.sortOrder ?? 0) + 1 },
  });

  return NextResponse.json({ faq });
}
