import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCopilotUser } from "@/lib/copilot-auth";

// GET /api/copilot/folders — list user's folders with chat counts
export async function GET() {
  const user = await getCopilotUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const folders = await prisma.chatFolder.findMany({
    where: { userId: user.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      _count: { select: { chats: true } },
    },
  });

  return NextResponse.json(folders);
}

// POST /api/copilot/folders — create a folder
export async function POST(req: NextRequest) {
  const user = await getCopilotUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, icon, description } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const folder = await prisma.chatFolder.create({
    data: {
      name: name.trim(),
      icon: icon || null,
      description: description || null,
      userId: user.id,
    },
  });

  return NextResponse.json(folder);
}

// PUT /api/copilot/folders — update a folder
export async function PUT(req: NextRequest) {
  const user = await getCopilotUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, icon, description } = await req.json();
  if (!id) return NextResponse.json({ error: "Folder ID required" }, { status: 400 });

  const folder = await prisma.chatFolder.findFirst({ where: { id, userId: user.id } });
  if (!folder) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.chatFolder.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(icon !== undefined && { icon }),
      ...(description !== undefined && { description }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/copilot/folders — delete a folder (chats become unfiled)
export async function DELETE(req: NextRequest) {
  const user = await getCopilotUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Folder ID required" }, { status: 400 });

  const folder = await prisma.chatFolder.findFirst({ where: { id, userId: user.id } });
  if (!folder) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Unassign chats from this folder
  await prisma.chat.updateMany({ where: { folderId: id }, data: { folderId: null } });
  await prisma.chatFolder.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
