import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prompts = await prisma.ragPrompt.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(prompts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, systemPrompt, temperature, model, isActive } = await req.json();

  if (!name || !systemPrompt) {
    return NextResponse.json({ error: "Name and system prompt are required" }, { status: 400 });
  }

  // If setting as active, deactivate all others
  if (isActive) {
    await prisma.ragPrompt.updateMany({ data: { isActive: false } });
  }

  const prompt = await prisma.ragPrompt.create({
    data: {
      name,
      systemPrompt,
      temperature: temperature ?? 0.7,
      model: model ?? "gpt-4",
      isActive: isActive ?? false,
    },
  });

  return NextResponse.json(prompt);
}
