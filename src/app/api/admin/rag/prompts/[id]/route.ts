import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, systemPrompt, temperature, model, isActive } = await req.json();

  // If setting as active, deactivate all others
  if (isActive) {
    await prisma.ragPrompt.updateMany({ data: { isActive: false } });
  }

  const prompt = await prisma.ragPrompt.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(systemPrompt !== undefined && { systemPrompt }),
      ...(temperature !== undefined && { temperature }),
      ...(model !== undefined && { model }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json(prompt);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.ragPrompt.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
