import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let settings = await prisma.ragSettings.findFirst();

  // Create default settings if none exist
  if (!settings) {
    settings = await prisma.ragSettings.create({
      data: {
        retrievalLimit: 5,
        chunkSize: 500,
        chunkOverlap: 50,
        similarityThreshold: 0.7,
        embeddingModel: "text-embedding-3-small",
        chatModel: "gpt-4",
        temperature: 0.7,
        maxTokens: 2000,
      },
    });
  }

  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  let settings = await prisma.ragSettings.findFirst();

  if (settings) {
    settings = await prisma.ragSettings.update({
      where: { id: settings.id },
      data: {
        ...(body.retrievalLimit !== undefined && { retrievalLimit: body.retrievalLimit }),
        ...(body.chunkSize !== undefined && { chunkSize: body.chunkSize }),
        ...(body.chunkOverlap !== undefined && { chunkOverlap: body.chunkOverlap }),
        ...(body.similarityThreshold !== undefined && { similarityThreshold: body.similarityThreshold }),
        ...(body.embeddingModel !== undefined && { embeddingModel: body.embeddingModel }),
        ...(body.chatModel !== undefined && { chatModel: body.chatModel }),
        ...(body.temperature !== undefined && { temperature: body.temperature }),
        ...(body.maxTokens !== undefined && { maxTokens: body.maxTokens }),
      },
    });
  } else {
    settings = await prisma.ragSettings.create({ data: body });
  }

  return NextResponse.json(settings);
}
