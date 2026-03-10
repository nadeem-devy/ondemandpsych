import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCopilotUser } from "@/lib/copilot-auth";
import { checkTrialLimit, incrementTrialCount } from "@/lib/trial-guard";
import OpenAI from "openai";

const SYSTEM_PROMPT = `You are the OnDemandPsych Clinical Co-Pilot — the world's first psychiatric clinical decision-support tool built by a triple board-certified psychiatrist.

**CRITICAL DISCLAIMER (include at the top of EVERY response):**
> **Disclaimer:** For licensed healthcare providers only. Educational use only. Not medical advice. Providers must exercise independent clinical judgment. Not intended for patient use.

**YOUR ROLE:**
- You are a psychiatric clinical co-pilot providing real-time decision support
- You deliver diagnostic reasoning, medication strategies, risk assessments, and chart-ready documentation
- You follow evidence-based guidelines (APA, NICE, Maudsley, DSM-5-TR, ICD-10)
- You support clinicians — you do NOT replace clinical judgment

**RESPONSE FORMAT — Always use this structured format when clinically relevant:**
1. Case Summary (table format)
2. Diagnostic Formulation (differential diagnosis with DSM-5-TR codes)
3. Treatment Goals
4. Medication Strategy (with dosing tables: medication, starting dose, target dose, titration, rationale)
5. Psychotherapy & Skills Training (modality, indications, frequency)
6. Risk & Safety Assessment
7. Rating-Scale Monitoring (scale, purpose, frequency)
8. Follow-Up Plan
9. Final Recommendations

**MODULES YOU COVER:**
- Diagnostic Formulation & DSM-5-TR Coding
- Psychopharmacology (212+ medications, dosing, titration, tapering, interactions)
- Risk Assessment (SAFE-T, C-SSRS)
- Documentation & Compliance
- Child & Adolescent Psychiatry
- Geriatric Psychiatry
- Emergency Psychiatry
- Consultation-Liaison Psychiatry
- Substance Use & Dual Diagnosis
- Pharmacogenomics & Precision Medicine

**FORMATTING RULES:**
- Use markdown with tables, headers, and bold text
- Use clinical abbreviations appropriately (QAM, QHS, BID, PRN, etc.)
- Include ICD-10 codes with diagnoses
- Always include safety monitoring parameters for medications
- Include Black Box warnings where applicable

**END EVERY RESPONSE WITH:**
---
⏱ **Time-Saving Note**
"This psychiatric clinical module was generated in seconds, reducing comprehensive documentation time by 20–25 minutes while maintaining clinical accuracy."

---
📚 **Educational Resources:**
- Simulation: Related Clinical Scenarios
- Evidence-Based Practice Guidelines
- DSM-5-TR Reference Materials

---
**OPTIONAL PROMPTS**
- Would you like to review key Teaching Points for this topic?
- Would you like a more detailed analysis of this topic?
- Would you like to generate documentation for this case?`;

// GET /api/copilot/messages?chatId=xxx — get messages for a chat
export async function GET(req: NextRequest) {
  const user = await getCopilotUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chatId = req.nextUrl.searchParams.get("chatId");
  if (!chatId) return NextResponse.json({ error: "chatId required" }, { status: 400 });

  const chat = await prisma.chat.findFirst({ where: { id: chatId, userId: user.id } });
  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

// POST /api/copilot/messages — send a message and get AI response
export async function POST(req: NextRequest) {
  const user = await getCopilotUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { chatId, content } = await req.json();
  if (!chatId || !content) {
    return NextResponse.json({ error: "chatId and content required" }, { status: 400 });
  }

  const chat = await prisma.chat.findFirst({ where: { id: chatId, userId: user.id } });
  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Trial limit enforcement
  const trial = await checkTrialLimit(user.id);
  if (!trial.allowed) {
    return NextResponse.json({
      error: trial.reason,
      trialLimitReached: true,
      used: trial.used,
      limit: trial.limit,
    }, { status: 403 });
  }

  const userMessage = await prisma.message.create({
    data: { chatId, role: "user", content },
  });

  // Auto-title on first message
  const messageCount = await prisma.message.count({ where: { chatId } });
  if (messageCount === 1) {
    const title = content.length > 50 ? content.substring(0, 50) + "..." : content;
    await prisma.chat.update({ where: { id: chatId }, data: { title } });
  }

  // Get conversation history for context
  const history = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
    take: 50, // last 50 messages for context
  });

  // Generate AI response via OpenAI
  const aiContent = await generateAIResponse(history);
  const assistantMessage = await prisma.message.create({
    data: { chatId, role: "assistant", content: aiContent },
  });

  await prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });

  // Increment trial count for free users
  await incrementTrialCount(user.id);

  return NextResponse.json({ userMessage, assistantMessage, trial: { remaining: trial.remaining > 0 ? trial.remaining - 1 : -1, limit: trial.limit } });
}

async function generateAIResponse(history: { role: string; content: string }[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return "> **Disclaimer:** For licensed healthcare providers only. Educational use only. Not medical advice.\n\n⚠️ **AI service is not configured.** Please contact support. The clinical co-pilot requires an OpenAI API key to function.";
  }

  try {
    const openai = new OpenAI({ apiKey });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 4096,
      temperature: 0.3, // Low temperature for clinical accuracy
    });

    return completion.choices[0]?.message?.content || "I apologize, but I was unable to generate a response. Please try again.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "> **Disclaimer:** For licensed healthcare providers only. Educational use only. Not medical advice.\n\n⚠️ **AI service temporarily unavailable.** Please try again in a moment. If the issue persists, contact support.";
  }
}
