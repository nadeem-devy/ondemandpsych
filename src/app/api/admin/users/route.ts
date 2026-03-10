import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// GET /api/admin/users — list users with filters
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(params.get("page") || "1"));
  const limit = Math.min(100, parseInt(params.get("limit") || "20"));
  const search = params.get("search") || "";
  const status = params.get("status") || "";
  const plan = params.get("plan") || "";
  const sort = params.get("sort") || "createdAt";
  const order = params.get("order") === "asc" ? "asc" : "desc";
  const format = params.get("format") || "json";

  // Build where clause
  const where: Prisma.ClientUserWhereInput = { deletedAt: null };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { organization: { contains: search } },
    ];
  }
  if (status) where.status = status;
  if (plan) where.plan = plan;

  // CSV export
  if (format === "csv") {
    const users = await prisma.clientUser.findMany({
      where,
      orderBy: { [sort]: order },
    });

    const header = "ID,Name,Email,Organization,Role,Plan,Status,Trial Used,Trial Limit,Created At\n";
    const rows = users.map((u) =>
      `"${u.id}","${u.name}","${u.email}","${u.organization || ""}","${u.role || ""}","${u.plan}","${u.status}",${u.trialMessageCount},${u.trialMessageLimit},"${u.createdAt.toISOString()}"`
    ).join("\n");

    return new NextResponse(header + rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="users-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  const [users, total] = await Promise.all([
    prisma.clientUser.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        organization: true,
        role: true,
        status: true,
        plan: true,
        planExpiresAt: true,
        subscriptionStatus: true,
        trialMessageCount: true,
        trialMessageLimit: true,
        lastLoginAt: true,
        emailVerified: true,
        tags: true,
        createdAt: true,
        _count: { select: { chats: true } },
      },
    }),
    prisma.clientUser.count({ where }),
  ]);

  return NextResponse.json({
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
