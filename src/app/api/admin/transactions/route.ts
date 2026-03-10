import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(params.get("page") || "1"));
  const limit = Math.min(100, parseInt(params.get("limit") || "20"));
  const status = params.get("status") || "";
  const type = params.get("type") || "";
  const search = params.get("search") || "";
  const format = params.get("format") || "json";

  const where: Prisma.TransactionWhereInput = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { user: { email: { contains: search } } },
      { user: { name: { contains: search } } },
      { planName: { contains: search } },
    ];
  }

  if (format === "csv") {
    const txns = await prisma.transaction.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    const header = "ID,User,Email,Type,Amount,Currency,Status,Plan,Date\n";
    const rows = txns.map((t) =>
      `"${t.id}","${t.user.name}","${t.user.email}","${t.type}",${t.amount},"${t.currency}","${t.status}","${t.planName || ""}","${t.createdAt.toISOString()}"`
    ).join("\n");
    return new NextResponse(header + rows, {
      headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().split("T")[0]}.csv"` },
    });
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  // Summary stats
  const [totalRevenue, failedCount] = await Promise.all([
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { status: "completed" } }),
    prisma.transaction.count({ where: { status: "failed" } }),
  ]);

  return NextResponse.json({
    transactions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    stats: { totalRevenue: totalRevenue._sum.amount || 0, failedCount },
  });
}
