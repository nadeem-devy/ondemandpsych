import OpenAI from "openai";
import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate embedding for a text string using OpenAI.
 */
export async function generateEmbedding(
  text: string,
  model = "text-embedding-3-small"
): Promise<number[]> {
  const res = await openai.embeddings.create({
    model,
    input: text.replace(/\n/g, " ").trim(),
  });
  return res.data[0].embedding;
}

/**
 * Chunk text into segments of roughly `chunkSize` tokens with overlap.
 * Uses simple word-based splitting (1 token ≈ 0.75 words).
 */
export function chunkText(
  text: string,
  chunkSize = 500,
  overlap = 50
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const wordsPerChunk = Math.round(chunkSize * 0.75);
  const overlapWords = Math.round(overlap * 0.75);
  const chunks: string[] = [];

  let i = 0;
  while (i < words.length) {
    const end = Math.min(i + wordsPerChunk, words.length);
    chunks.push(words.slice(i, end).join(" "));
    i = end - overlapWords;
    if (i >= words.length - overlapWords) {
      if (end < words.length) chunks.push(words.slice(end - overlapWords).join(" "));
      break;
    }
  }

  return chunks.filter((c) => c.trim().length > 0);
}

/**
 * Store an embedding in the pgvector column using raw SQL.
 */
async function storeEmbedding(chunkId: string, embedding: number[]) {
  const vectorStr = `[${embedding.join(",")}]`;
  await prisma.$executeRawUnsafe(
    `UPDATE "RagChunk" SET embedding_vec = $1::vector WHERE id = $2`,
    vectorStr,
    chunkId
  );
}

/**
 * Retrieve top-K relevant chunks using pgvector cosine distance.
 * Uses the HNSW index for fast approximate nearest neighbor search.
 */
export async function retrieveChunks(
  query: string,
  topK = 5,
  similarityThreshold = 0.7
) {
  const queryEmbedding = await generateEmbedding(query);
  const vectorStr = `[${queryEmbedding.join(",")}]`;

  // pgvector: <=> is cosine distance (0 = identical, 2 = opposite)
  // similarity = 1 - distance
  const distanceThreshold = 1 - similarityThreshold;

  const results: {
    id: string;
    documentId: string;
    content: string;
    chunkIndex: number;
    tokenCount: number;
    metadata: string | null;
    distance: number;
    docTitle: string;
    docCategory: string | null;
  }[] = await prisma.$queryRawUnsafe(
    `SELECT
       c.id, c."documentId", c.content, c."chunkIndex", c."tokenCount", c.metadata,
       (c.embedding_vec <=> $1::vector) as distance,
       d.title as "docTitle", d.category as "docCategory"
     FROM "RagChunk" c
     JOIN "RagDocument" d ON d.id = c."documentId"
     WHERE c.embedding_vec IS NOT NULL
       AND (c.embedding_vec <=> $1::vector) <= $2
     ORDER BY c.embedding_vec <=> $1::vector
     LIMIT $3`,
    vectorStr,
    distanceThreshold,
    topK
  );

  return results.map((r) => ({
    id: r.id,
    documentId: r.documentId,
    content: r.content,
    chunkIndex: r.chunkIndex,
    tokenCount: r.tokenCount,
    metadata: r.metadata,
    similarity: 1 - Number(r.distance),
    document: { title: r.docTitle, category: r.docCategory },
  }));
}

/**
 * Process a document: chunk text, generate embeddings, store in DB with pgvector.
 */
export async function processDocument(documentId: string, text: string) {
  const settings = await prisma.ragSettings.findFirst();
  const chunkSize = settings?.chunkSize ?? 500;
  const chunkOverlap = settings?.chunkOverlap ?? 50;
  const embeddingModel = settings?.embeddingModel ?? "text-embedding-3-small";

  await prisma.ragDocument.update({
    where: { id: documentId },
    data: { status: "processing" },
  });

  try {
    // Delete existing chunks
    await prisma.ragChunk.deleteMany({ where: { documentId } });

    // Chunk the text
    const chunks = chunkText(text, chunkSize, chunkOverlap);

    // Generate embeddings and store chunks with pgvector
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbedding(chunks[i], embeddingModel);

      // Create the chunk record
      const chunk = await prisma.ragChunk.create({
        data: {
          documentId,
          content: chunks[i],
          chunkIndex: i,
          tokenCount: Math.round(chunks[i].split(/\s+/).length / 0.75),
          embedding: JSON.stringify(embedding), // JSON fallback
        },
      });

      // Store native pgvector embedding
      await storeEmbedding(chunk.id, embedding);
    }

    await prisma.ragDocument.update({
      where: { id: documentId },
      data: { status: "indexed" },
    });

    return { success: true, chunksCreated: chunks.length };
  } catch (error) {
    await prisma.ragDocument.update({
      where: { id: documentId },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}

/**
 * RAG-augmented chat completion.
 */
export async function ragQuery(userQuery: string, userId?: string) {
  const start = Date.now();

  const [activePrompt, settings] = await Promise.all([
    prisma.ragPrompt.findFirst({ where: { isActive: true } }),
    prisma.ragSettings.findFirst(),
  ]);

  const topK = settings?.retrievalLimit ?? 5;
  const threshold = settings?.similarityThreshold ?? 0.7;
  const model = settings?.chatModel ?? "gpt-4";
  const temperature = settings?.temperature ?? 0.7;
  const maxTokens = settings?.maxTokens ?? 2000;

  const systemPrompt =
    activePrompt?.systemPrompt ??
    "You are a psychiatric clinical co-pilot. Use the provided context to answer questions accurately. If the context doesn't contain relevant information, say so.";

  // Retrieve relevant chunks via pgvector
  const chunks = await retrieveChunks(userQuery, topK, threshold);
  const context = chunks
    .map((c, i) => `[Source ${i + 1}: ${c.document.title}]\n${c.content}`)
    .join("\n\n---\n\n");

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: `${systemPrompt}\n\n## Relevant Context:\n${context}` },
    { role: "user", content: userQuery },
  ];

  const completion = await openai.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  });

  const response = completion.choices[0]?.message?.content ?? "";
  const latencyMs = Date.now() - start;
  const tokensUsed = completion.usage?.total_tokens ?? 0;

  await prisma.ragQueryLog.create({
    data: {
      query: userQuery,
      response,
      chunksUsed: chunks.length,
      latencyMs,
      tokensUsed,
      userId,
    },
  });

  return { response, chunks: chunks.length, latencyMs, tokensUsed };
}
