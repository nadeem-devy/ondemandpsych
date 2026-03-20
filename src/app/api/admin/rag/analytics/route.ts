import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const NEW_RAG_URL = process.env.DO_RAG_URL || "https://chat.ondemandpsych.com";
const DO_API_TOKEN = process.env.DO_API_TOKEN || "sk-test-12345-abcdef-67890-ghijkl-mnopqr-stuvwx-yz1234";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const days = parseInt(req.nextUrl.searchParams.get("days") || "30");
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Get stats from new API's categories endpoint
  let doStats: { total_chunks: number; total_documents: number; total_categories: number; categories?: { name: string; chunk_count: number; document_count?: number }[] } = { total_chunks: 0, total_documents: 0, total_categories: 0 };
  try {
    const resp = await fetch(`${NEW_RAG_URL}/api/chat/ingest/available-categories`, {
      headers: { Authorization: `Bearer ${DO_API_TOKEN}` },
    });
    if (resp.ok) {
      const data = await resp.json();
      doStats = {
        total_chunks: data.total_chunks || 0,
        total_documents: data.total_documents || 0,
        total_categories: data.total_categories || 0,
        categories: (data.categories_details || []).map((c: { name: string; chunk_count: number; document_count?: number }) => ({
          name: c.name,
          chunk_count: c.chunk_count,
          document_count: c.document_count,
        })),
      };
    }
  } catch {
    // RAG service unreachable — use zeros
  }

  // Get query analytics from local PostgreSQL (RagQueryLog)
  const [totalQueries, recentQueries, avgLatency, avgTokens, feedbackStats] = await Promise.all([
    prisma.ragQueryLog.count({ where: { createdAt: { gte: since } } }),
    prisma.ragQueryLog.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, query: true, chunksUsed: true, latencyMs: true, tokensUsed: true, feedback: true, createdAt: true },
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

  return NextResponse.json({
    totalDocuments: doStats.total_documents,
    indexedDocs: doStats.total_documents,
    failedDocs: 0,
    totalChunks: doStats.total_chunks,
    totalCategories: doStats.total_categories,
    totalQueries,
    avgLatencyMs: Math.round(avgLatency._avg.latencyMs ?? 0),
    avgTokensUsed: Math.round(avgTokens._avg.tokensUsed ?? 0),
    feedbackStats,
    categories: doStats.categories || [],
    recentQueries,
  });
}
