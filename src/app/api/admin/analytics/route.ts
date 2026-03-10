import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    freeUsers,
    paidUsers,
    newUsersThisMonth,
    newUsersThisWeek,
    totalChats,
    totalMessages,
    messagesThisWeek,
    openTickets,
    totalTickets,
  ] = await Promise.all([
    prisma.clientUser.count({ where: { deletedAt: null } }),
    prisma.clientUser.count({ where: { status: "active", deletedAt: null } }),
    prisma.clientUser.count({ where: { status: "suspended", deletedAt: null } }),
    prisma.clientUser.count({ where: { plan: "free", deletedAt: null } }),
    prisma.clientUser.count({ where: { plan: { not: "free" }, deletedAt: null } }),
    prisma.clientUser.count({ where: { createdAt: { gte: thirtyDaysAgo }, deletedAt: null } }),
    prisma.clientUser.count({ where: { createdAt: { gte: sevenDaysAgo }, deletedAt: null } }),
    prisma.chat.count(),
    prisma.message.count(),
    prisma.message.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.supportTicket.count({ where: { status: { not: "closed" } } }),
    prisma.supportTicket.count(),
  ]);

  // Plan breakdown
  const planBreakdown = await prisma.clientUser.groupBy({
    by: ["plan"],
    _count: true,
    where: { deletedAt: null },
  });

  // Recent signups (last 7 days, grouped by day)
  const recentSignups = await prisma.clientUser.findMany({
    where: { createdAt: { gte: sevenDaysAgo }, deletedAt: null },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Trial conversion rate
  const trialExhausted = await prisma.clientUser.count({
    where: { plan: "free", trialMessageCount: { gte: 10 }, deletedAt: null },
  });

  // Action required items
  const [unverifiedUsers, pastDueUsers, failedPayments, trialsEndingSoon] = await Promise.all([
    prisma.clientUser.count({ where: { emailVerified: false, deletedAt: null } }),
    prisma.clientUser.count({ where: { subscriptionStatus: "past_due", deletedAt: null } }),
    prisma.transaction.count({ where: { status: "failed" } }),
    prisma.clientUser.count({
      where: {
        plan: "free",
        deletedAt: null,
        trialMessageCount: { gte: 7 },
        trialMessageLimit: { gt: 0 },
      },
    }),
  ]);

  return NextResponse.json({
    kpis: {
      totalUsers,
      activeUsers,
      suspendedUsers,
      freeUsers,
      paidUsers,
      newUsersThisMonth,
      newUsersThisWeek,
      totalChats,
      totalMessages,
      messagesThisWeek,
      openTickets,
      totalTickets,
      trialExhausted,
      conversionRate: totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : "0",
    },
    planBreakdown: planBreakdown.map((p) => ({ plan: p.plan, count: p._count })),
    recentSignups: recentSignups.map((s) => s.createdAt.toISOString().split("T")[0]),
    actionRequired: {
      unverifiedUsers,
      pastDueUsers,
      failedPayments,
      trialsEndingSoon,
      openTickets,
    },
  });
}
