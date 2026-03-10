import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

// GET — list all plans
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plans = await prisma.plan.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ plans });
}

// POST — create plan
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const plan = await prisma.plan.create({
    data: {
      name: body.name,
      displayName: body.displayName,
      description: body.description || null,
      priceMonthly: body.priceMonthly || 0,
      priceYearly: body.priceYearly || 0,
      messageLimit: body.messageLimit ?? -1,
      features: body.features ? JSON.stringify(body.features) : null,
      sortOrder: body.sortOrder || 0,
    },
  });

  await logAudit({
    actorId: session.user.id || "unknown",
    actorEmail: session.user.email || "unknown",
    actorType: "admin",
    action: "plan.create",
    targetType: "Plan",
    targetId: plan.id,
    details: { name: plan.name },
  });

  return NextResponse.json({ plan });
}
