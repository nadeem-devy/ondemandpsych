import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessions = await prisma.adminSession.findMany({
    where: { isActive: true },
    orderBy: { lastSeenAt: "desc" },
  });

  return NextResponse.json({ sessions });
}
