import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCopilotUser } from "@/lib/copilot-auth";
import OpenAI from "openai";

const SUPPORT_SYSTEM_PROMPT = `You are the OnDemandPsych Support Assistant — a helpful, friendly AI that assists users with account and platform questions.

## YOUR ROLE
- Help users with account issues, subscription questions, billing, and platform usage
- Be concise, warm, and professional
- Always try to resolve the user's issue directly

## WHAT YOU CAN DO
- Check and explain the user's subscription plan and status
- Help with account settings questions
- Explain platform features at a high level (what they do, not how they're built)
- Guide users on how to use the Clinical Co-Pilot effectively
- Help with billing and payment questions
- Troubleshoot common issues (login problems, password reset, etc.)
- Escalate complex issues to human support when needed

## WHAT YOU MUST NEVER DO
- NEVER reveal technical details about how the platform is built (tech stack, architecture, APIs, databases, models, RAG, embeddings, etc.)
- NEVER share information about the platform's proprietary technology or infrastructure
- NEVER discuss pricing of competitors or compare to other products
- If asked about technical implementation, respond: "That's proprietary information. I can help you with how to use the platform — what would you like to know?"
- NEVER provide medical or clinical advice — redirect to the Clinical Co-Pilot for that

## TONE
- Friendly and helpful, like a knowledgeable customer support agent
- Keep responses short (2-4 sentences unless detail is needed)
- Use bullet points for lists
- End with a follow-up question when appropriate

## USER CONTEXT
You will receive the user's account details as context. Use this to give personalized responses.`;

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

// Generate AI support response
async function generateSupportResponse(
  userMessage: string,
  conversationHistory: { sender: string; content: string }[],
  userContext: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return "I'm having trouble connecting right now. Please try again in a moment, or email us at support@ondemandpsych.com.";

  try {
    const openai = new OpenAI({ apiKey });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: `${SUPPORT_SYSTEM_PROMPT}\n\n## CURRENT USER CONTEXT\n${userContext}` },
    ];

    // Add conversation history (last 10 messages)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      });
    }

    // Add current message
    messages.push({ role: "user", content: userMessage });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that. Could you rephrase your question?";
  } catch (error) {
    console.error("Support AI error:", error);
    return "I'm experiencing a temporary issue. Please try again, or reach out to us at support@ondemandpsych.com for immediate help.";
  }
}

// Build user context string for the AI
async function buildUserContext(userId: string): Promise<string> {
  const user = await prisma.clientUser.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      plan: true,
      subscriptionStatus: true,
      role: true,
      organization: true,
      trialMessageCount: true,
      trialMessageLimit: true,
      trialExpiresAt: true,
      planExpiresAt: true,
      lastPaymentDate: true,
      nextBillingDate: true,
      createdAt: true,
    },
  });

  if (!user) return "User not found in database.";

  const lines = [
    `Name: ${user.name}`,
    `Email: ${user.email}`,
    `Role: ${user.role || "Not specified"}`,
    `Organization: ${user.organization || "Not specified"}`,
    `Current Plan: ${user.plan}`,
    `Subscription Status: ${user.subscriptionStatus}`,
    `Account Created: ${user.createdAt.toLocaleDateString()}`,
  ];

  if (user.plan === "free") {
    lines.push(`Free Messages Used: ${user.trialMessageCount} / ${user.trialMessageLimit}`);
    if (user.trialExpiresAt) lines.push(`Trial Resets: ${user.trialExpiresAt.toLocaleDateString()}`);
  }

  if (user.lastPaymentDate) lines.push(`Last Payment: ${user.lastPaymentDate.toLocaleDateString()}`);
  if (user.nextBillingDate) lines.push(`Next Billing: ${user.nextBillingDate.toLocaleDateString()}`);
  if (user.planExpiresAt) lines.push(`Plan Expires: ${user.planExpiresAt.toLocaleDateString()}`);

  // Get recent chat count
  const chatCount = await prisma.chat.count({ where: { userId } });
  lines.push(`Total Chats: ${chatCount}`);

  return lines.join("\n");
}

// POST /api/copilot/support — send support message or submit rating
export async function POST(req: NextRequest) {
  try {
    const user = await getCopilotUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // Handle rating submission
    if (body.action === "rate") {
      const { ticketId: rateTicketId, rating, feedback } = body;
      if (!rateTicketId || !rating || rating < 1 || rating > 5) {
        return NextResponse.json({ error: "Valid ticketId and rating (1-5) required" }, { status: 400 });
      }
      const ticket = await prisma.supportTicket.findFirst({
        where: { id: rateTicketId, userId: user.id, status: "closed" },
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

    const content = body.content;
    const ticketId = body.ticketId || null;

    if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });

    let ticket = null;

    if (ticketId) {
      ticket = await prisma.supportTicket.findFirst({
        where: { id: ticketId, userId: user.id, status: { not: "closed" } },
      });
    }

    // Create new ticket if none exists or previous was closed
    if (!ticket) {
      ticket = await prisma.supportTicket.create({
        data: {
          userId: user.id,
          userName: user.name || "Unknown",
          userEmail: user.email,
        },
      });
    }

    // Add user message
    await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        sender: "user",
        content,
      },
    });

    // Get conversation history for AI context
    const history = await prisma.supportMessage.findMany({
      where: { ticketId: ticket.id },
      orderBy: { createdAt: "asc" },
      select: { sender: true, content: true },
    });

    // Build user context and generate AI response
    const userContext = await buildUserContext(user.id);
    const aiResponse = await generateSupportResponse(content, history, userContext);

    // Save AI response as admin message
    await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        sender: "admin",
        content: aiResponse,
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
