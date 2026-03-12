import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const days = parseInt(req.nextUrl.searchParams.get("days") || "30");
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [
    totalDocuments,
    totalChunks,
    totalQueries,
    recentQueries,
    avgLatency,
    avgTokens,
    feedbackStats,
  ] = await Promise.all([
    prisma.ragDocument.count(),
    prisma.ragChunk.count(),
    prisma.ragQueryLog.count({ where: { createdAt: { gte: since } } }),
    prisma.ragQueryLog.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        query: true,
        chunksUsed: true,
        latencyMs: true,
        tokensUsed: true,
        feedback: true,
        createdAt: true,
      },
    }),
    prisma.ragQueryLog.aggregate({
      where: { createdAt: { gte: since } },
      _avg: { latencyMs: true },
    }),
    prisma.ragQueryLog.aggregate({
      where: { createdAt: { gte: since } },
      _avg: { tokensUsed: true },
    }),
    prisma.ragQueryLog.groupBy({
      by: ["feedback"],
      where: { createdAt: { gte: since }, feedback: { not: null } },
      _count: true,
    }),
  ]);

  const indexedDocs = await prisma.ragDocument.count({ where: { status: "indexed" } });
  const failedDocs = await prisma.ragDocument.count({ where: { status: "failed" } });

  return NextResponse.json({
    totalDocuments,
    indexedDocs,
    failedDocs,
    totalChunks,
    totalQueries,
    avgLatencyMs: Math.round(avgLatency._avg.latencyMs ?? 0),
    avgTokensUsed: Math.round(avgTokens._avg.tokensUsed ?? 0),
    feedbackStats,
    recentQueries,
  });
}
