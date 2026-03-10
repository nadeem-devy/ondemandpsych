import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

// PATCH — update plan
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.plan.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const plan = await prisma.plan.update({
    where: { id },
    data: {
      ...(body.displayName !== undefined && { displayName: body.displayName }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.priceMonthly !== undefined && { priceMonthly: body.priceMonthly }),
      ...(body.priceYearly !== undefined && { priceYearly: body.priceYearly }),
      ...(body.messageLimit !== undefined && { messageLimit: body.messageLimit }),
      ...(body.features !== undefined && { features: JSON.stringify(body.features) }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
    },
  });

  await logAudit({
    actorId: session.user.id || "unknown",
    actorEmail: session.user.email || "unknown",
    actorType: "admin",
    action: "plan.update",
    targetType: "Plan",
    targetId: id,
    details: body,
  });

  return NextResponse.json({ plan });
}

// DELETE — deactivate plan
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.plan.update({ where: { id }, data: { isActive: false } });

  await logAudit({
    actorId: session.user.id || "unknown",
    actorEmail: session.user.email || "unknown",
    actorType: "admin",
    action: "plan.deactivate",
    targetType: "Plan",
    targetId: id,
  });

  return NextResponse.json({ success: true });
}
