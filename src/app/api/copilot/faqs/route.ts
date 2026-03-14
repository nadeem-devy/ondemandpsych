import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const faqs = await prisma.fAQ.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(faqs);
}
