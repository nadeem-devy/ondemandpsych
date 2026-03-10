import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

// DELETE — revoke session
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await prisma.adminSession.update({
    where: { id },
    data: { isActive: false },
  });

  await logAudit({
    actorId: session.user.id || "unknown",
    actorEmail: session.user.email || "unknown",
    actorType: "admin",
    action: "session.revoke",
    targetType: "AdminSession",
    targetId: id,
  });

  return NextResponse.json({ success: true });
}
