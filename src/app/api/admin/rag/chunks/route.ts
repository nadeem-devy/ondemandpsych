import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateEmbedding } from "@/lib/rag";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const documentId = req.nextUrl.searchParams.get("documentId");
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");

  const where = documentId ? { documentId } : {};

  const [chunks, total] = await Promise.all([
    prisma.ragChunk.findMany({
      where,
      orderBy: [{ documentId: "asc" }, { chunkIndex: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: { document: { select: { title: true } } },
    }),
    prisma.ragChunk.count({ where }),
  ]);

  return NextResponse.json({ chunks, total, page, totalPages: Math.ceil(total / limit) });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, content } = await req.json();
  if (!id || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Update content and regenerate embedding
  const settings = await prisma.ragSettings.findFirst();
  const embeddingModel = settings?.embeddingModel ?? "text-embedding-3-small";
  const embedding = await generateEmbedding(content, embeddingModel);

  const chunk = await prisma.ragChunk.update({
    where: { id },
    data: {
      content,
      tokenCount: Math.round(content.split(/\s+/).length / 0.75),
      embedding: JSON.stringify(embedding),
    },
  });

  // Update pgvector column
  const vectorStr = `[${embedding.join(",")}]`;
  await prisma.$executeRawUnsafe(
    `UPDATE "RagChunk" SET embedding_vec = $1::vector WHERE id = $2`,
    vectorStr,
    id
  );

  return NextResponse.json(chunk);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.ragChunk.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
