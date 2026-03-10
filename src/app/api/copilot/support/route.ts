import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCopilotUser } from "@/lib/copilot-auth";

// GET /api/copilot/support — get open ticket with messages
export async function GET(req: NextRequest) {
  try {
    const user = await getCopilotUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ticketId = req.nextUrl.searchParams.get("ticketId");

    if (ticketId) {
      const ticket = await prisma.supportTicket.findFirst({
        where: { id: ticketId, userId: user.id },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
      return NextResponse.json({ ticket });
    }

    // Find latest open ticket
    const ticket = await prisma.supportTicket.findFirst({
      where: { userId: user.id, status: { not: "closed" } },
      include: { messages: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ticket });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Support GET error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/copilot/support — send support message
export async function POST(req: NextRequest) {
  try {
    const user = await getCopilotUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const content = body.content;
    const ticketId = body.ticketId || null;

    if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });

    let ticket = null;

    if (ticketId) {
      ticket = await prisma.supportTicket.findFirst({
        where: { id: ticketId, userId: user.id },
      });
    }

    // Create new ticket if none exists
    if (!ticket) {
      ticket = await prisma.supportTicket.create({
        data: {
          userId: user.id,
          userName: user.name || "Unknown",
          userEmail: user.email,
        },
      });
    }

    // Add message
    await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        sender: "user",
        content,
      },
    });

    // Update ticket timestamp
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { updatedAt: new Date() },
    });

    // Return ticket with all messages
    const updated = await prisma.supportTicket.findUnique({
      where: { id: ticket.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    return NextResponse.json({ ticket: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Support POST error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
