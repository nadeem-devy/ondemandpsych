import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCopilotUser } from "@/lib/copilot-auth";

// GET /api/copilot/chats — list user's chats
export async function GET() {
  const user = await getCopilotUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chats = await prisma.chat.findMany({
    where: { userId: user.id, archived: false },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { content: true, createdAt: true },
      },
    },
  });

  return NextResponse.json(chats);
}

// POST /api/copilot/chats — create new chat
export async function POST(req: NextRequest) {
  const user = await getCopilotUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title } = await req.json().catch(() => ({ title: "New Chat" }));

  const chat = await prisma.chat.create({
    data: {
      title: title || "New Chat",
      userId: user.id,
    },
  });

  return NextResponse.json(chat);
}

// PUT /api/copilot/chats — update chat (rename, pin, archive)
export async function PUT(req: NextRequest) {
  const user = await getCopilotUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, title, pinned, archived } = await req.json();
  if (!id) return NextResponse.json({ error: "Chat ID required" }, { status: 400 });

  const chat = await prisma.chat.findFirst({ where: { id, userId: user.id } });
  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.chat.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(pinned !== undefined && { pinned }),
      ...(archived !== undefined && { archived }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/copilot/chats — delete a chat
export async function DELETE(req: NextRequest) {
  const user = await getCopilotUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Chat ID required" }, { status: 400 });

  const chat = await prisma.chat.findFirst({ where: { id, userId: user.id } });
  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.chat.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
