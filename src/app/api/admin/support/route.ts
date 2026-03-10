import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/support — list all tickets or single ticket messages
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ticketId = req.nextUrl.searchParams.get("ticketId");

  if (ticketId) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    return NextResponse.json({ ticket });
  }

  const tickets = await prisma.supportTicket.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { content: true, sender: true, createdAt: true },
      },
    },
  });

  return NextResponse.json(tickets);
}

// POST /api/admin/support — admin replies to a ticket
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ticketId, content } = await req.json();
  if (!ticketId || !content) {
    return NextResponse.json({ error: "ticketId and content required" }, { status: 400 });
  }

  await prisma.supportMessage.create({
    data: {
      ticketId,
      sender: "admin",
      content,
    },
  });

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() },
  });

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json({ ticket });
}

// PUT /api/admin/support — update ticket status
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ticketId, status } = await req.json();
  if (!ticketId || !status) {
    return NextResponse.json({ error: "ticketId and status required" }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status },
  });

  // Insert system message for status changes
  const systemMessages: Record<string, string> = {
    assigned: "Support team has joined the chat",
    closed: "This conversation has been closed",
    open: "This conversation has been reopened",
  };

  if (systemMessages[status]) {
    await prisma.supportMessage.create({
      data: {
        ticketId,
        sender: "system",
        content: systemMessages[status],
      },
    });
  }

  return NextResponse.json(ticket);
}
