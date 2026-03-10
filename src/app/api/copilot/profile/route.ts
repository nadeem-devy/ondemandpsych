import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCopilotUser, createCopilotToken, setCopilotCookie } from "@/lib/copilot-auth";
import { hash, compare } from "bcryptjs";

// GET /api/copilot/profile
export async function GET() {
  const user = await getCopilotUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const full = await prisma.clientUser.findUnique({
    where: { id: user.id },
    select: {
      id: true, email: true, name: true, phone: true,
      organization: true, role: true, plan: true,
      planExpiresAt: true, avatar: true, createdAt: true,
    },
  });

  return NextResponse.json(full);
}

// PUT /api/copilot/profile — update profile
export async function PUT(req: NextRequest) {
  const user = await getCopilotUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, phone, organization, role, currentPassword, newPassword } = await req.json();

  // Password change
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Current password required" }, { status: 400 });
    }
    const dbUser = await prisma.clientUser.findUnique({ where: { id: user.id } });
    if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const valid = await compare(currentPassword, dbUser.password);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

    const hashed = await hash(newPassword, 12);
    await prisma.clientUser.update({
      where: { id: user.id },
      data: { password: hashed },
    });
  }

  // Profile update
  const updated = await prisma.clientUser.update({
    where: { id: user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(organization !== undefined && { organization }),
      ...(role !== undefined && { role }),
    },
    select: {
      id: true, email: true, name: true, plan: true,
    },
  });

  // Refresh token with updated info
  const token = await createCopilotToken(updated);
  await setCopilotCookie(token);

  return NextResponse.json({ ok: true });
}
