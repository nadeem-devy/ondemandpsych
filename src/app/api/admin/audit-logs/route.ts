import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(params.get("page") || "1"));
  const limit = Math.min(100, parseInt(params.get("limit") || "30"));
  const action = params.get("action") || "";
  const actorType = params.get("actorType") || "";
  const search = params.get("search") || "";

  const where: Prisma.AuditLogWhereInput = {};
  if (action) where.action = { contains: action };
  if (actorType) where.actorType = actorType;
  if (search) {
    where.OR = [
      { actorEmail: { contains: search } },
      { action: { contains: search } },
      { targetId: { contains: search } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({
    logs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
