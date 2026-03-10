import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries = await prisma.ipAllowlist.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ipRange, description } = await req.json();
  if (!ipRange) return NextResponse.json({ error: "IP range required" }, { status: 400 });

  const entry = await prisma.ipAllowlist.create({
    data: { ipRange, description: description || null },
  });

  await logAudit({
    actorId: session.user.id || "unknown",
    actorEmail: session.user.email || "unknown",
    actorType: "admin",
    action: "ip_allowlist.add",
    details: { ipRange },
  });

  return NextResponse.json({ entry });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.ipAllowlist.delete({ where: { id } });

  await logAudit({
    actorId: session.user.id || "unknown",
    actorEmail: session.user.email || "unknown",
    actorType: "admin",
    action: "ip_allowlist.remove",
    details: { id },
  });

  return NextResponse.json({ success: true });
}
