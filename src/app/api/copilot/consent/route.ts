import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCopilotUser } from "@/lib/copilot-auth";

// GET — get active consent version & check if user accepted
export async function GET() {
  const user = await getCopilotUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const activeConsent = await prisma.consentVersion.findFirst({
    where: { isActive: true },
    orderBy: { publishedAt: "desc" },
  });

  if (!activeConsent) return NextResponse.json({ consent: null, accepted: true });

  const acceptance = await prisma.consentAcceptance.findUnique({
    where: { userId_consentVersionId: { userId: user.id, consentVersionId: activeConsent.id } },
  });

  return NextResponse.json({
    consent: activeConsent,
    accepted: !!acceptance,
  });
}

// POST — accept consent
export async function POST(req: NextRequest) {
  const user = await getCopilotUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { consentVersionId } = await req.json();
  if (!consentVersionId) return NextResponse.json({ error: "consentVersionId required" }, { status: 400 });

  const userAgent = req.headers.get("user-agent") || undefined;
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;

  await prisma.consentAcceptance.upsert({
    where: { userId_consentVersionId: { userId: user.id, consentVersionId } },
    create: {
      userId: user.id,
      consentVersionId,
      ipAddress: ip,
      userAgent: userAgent,
    },
    update: { acceptedAt: new Date() },
  });

  // Update user's consent version
  const version = await prisma.consentVersion.findUnique({ where: { id: consentVersionId } });
  if (version) {
    await prisma.clientUser.update({
      where: { id: user.id },
      data: { consentVersion: version.version },
    });
  }

  return NextResponse.json({ accepted: true });
}
