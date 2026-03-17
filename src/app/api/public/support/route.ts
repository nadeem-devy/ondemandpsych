import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/public/support — get open guest ticket with messages
export async function GET(req: NextRequest) {
  try {
    const ticketId = req.nextUrl.searchParams.get("ticketId");
    if (!ticketId) {
      return NextResponse.json({ ticket: null });
    }

    const ticket = await prisma.supportTicket.findFirst({
      where: { id: ticketId, userId: { startsWith: "guest_" } },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    return NextResponse.json({ ticket });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Public support GET error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/public/support — send guest support message or submit rating
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Handle rating submission
    if (body.action === "rate") {
      const { ticketId: rateTicketId, rating, feedback } = body;
      if (!rateTicketId || !rating || rating < 1 || rating > 5) {
        return NextResponse.json({ error: "Valid ticketId and rating (1-5) required" }, { status: 400 });
      }
      const ticket = await prisma.supportTicket.findFirst({
        where: { id: rateTicketId, userId: { startsWith: "guest_" }, status: "closed" },
      });
      if (!ticket) {
        return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
      }
      await prisma.supportTicket.update({
        where: { id: rateTicketId },
        data: { rating, ratingFeedback: feedback || null },
      });
      return NextResponse.json({ success: true });
    }

    const { content, ticketId, guestId, name, email } = body;

    if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });
    if (!guestId) return NextResponse.json({ error: "Guest ID required" }, { status: 400 });

    let ticket = null;

    if (ticketId) {
      ticket = await prisma.supportTicket.findFirst({
        where: { id: ticketId, userId: guestId, status: { not: "closed" } },
      });
    }

    // Create new ticket if none exists
    if (!ticket) {
      ticket = await prisma.supportTicket.create({
        data: {
          userId: guestId,
          userName: name || "Guest",
          userEmail: email || "guest@visitor",
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
    console.error("Public support POST error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
