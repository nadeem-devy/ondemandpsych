import OpenAI from "openai";
import { prisma } from "./prisma";

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
 * Cosine similarity between two vectors.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Retrieve top-K relevant chunks for a query.
 */
export async function retrieveChunks(
  query: string,
  topK = 5,
  similarityThreshold = 0.7
) {
  const queryEmbedding = await generateEmbedding(query);

  // Get all chunks that have embeddings
  const allChunks = await prisma.ragChunk.findMany({
    where: { embedding: { not: null } },
    include: { document: { select: { title: true, category: true } } },
  });

  // Calculate similarity scores
  const scored = allChunks
    .map((chunk) => {
      const embedding = JSON.parse(chunk.embedding!) as number[];
      const similarity = cosineSimilarity(queryEmbedding, embedding);
      return { ...chunk, similarity };
    })
    .filter((c) => c.similarity >= similarityThreshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  return scored;
}

/**
 * Process a document: chunk text, generate embeddings, store in DB.
 */
export async function processDocument(documentId: string, text: string) {
  // Get settings
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

    // Generate embeddings and store chunks
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbedding(chunks[i], embeddingModel);
      await prisma.ragChunk.create({
        data: {
          documentId,
          content: chunks[i],
          chunkIndex: i,
          tokenCount: Math.round(chunks[i].split(/\s+/).length / 0.75),
          embedding: JSON.stringify(embedding),
        },
      });
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

  // Get active prompt and settings
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

  // Retrieve relevant chunks
  const chunks = await retrieveChunks(userQuery, topK, threshold);
  const context = chunks
    .map((c, i) => `[Source ${i + 1}: ${c.document.title}]\n${c.content}`)
    .join("\n\n---\n\n");

  // Build messages
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

  // Log the query
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
