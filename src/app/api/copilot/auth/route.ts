import { NextRequest, NextResponse } from "next/server";
import { hash, compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createCopilotToken, setCopilotCookie, clearCopilotCookie } from "@/lib/copilot-auth";
import { logAudit } from "@/lib/audit";
import { lifecycle } from "@/lib/email";

// POST /api/copilot/auth — login, register, or password reset
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, email, password, name, role, newPassword } = body;

  // Password reset (admin or user-initiated)
  if (action === "reset_password") {
    if (!email || !newPassword) {
      return NextResponse.json({ error: "email and newPassword required" }, { status: 400 });
    }
    const user = await prisma.clientUser.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const hashed = await hash(newPassword, 12);
    await prisma.clientUser.update({ where: { id: user.id }, data: { password: hashed } });

    await logAudit({
      actorId: user.id,
      actorEmail: email,
      actorType: "client",
      action: "password.reset",
      targetType: "ClientUser",
      targetId: user.id,
    });

    return NextResponse.json({ success: true });
  }

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  if (action === "register") {
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const existing = await prisma.clientUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Account already exists" }, { status: 409 });
    }

    const hashed = await hash(password, 12);
    const user = await prisma.clientUser.create({
      data: { email, password: hashed, name, emailVerified: false, ...(role && { role }) },
    });

    // Send verification OTP
    const { createOtp } = await import("@/lib/otp");
    const otpRecord = await createOtp({ userId: user.id, email, type: "email_verify" });
    await lifecycle.otpVerification(user.email, user.name, otpRecord.code);

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      actorType: "client",
      action: "user.register",
      targetType: "ClientUser",
      targetId: user.id,
    });

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, plan: user.plan }, requireVerification: true });
  }

  // Login
  const user = await prisma.clientUser.findUnique({ where: { email } });
  if (!user) {
    await logAudit({ actorId: "unknown", actorEmail: email, actorType: "client", action: "login.failed", details: { reason: "user_not_found" } });
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Check if account is suspended/deactivated
  if (user.status !== "active") {
    await logAudit({ actorId: user.id, actorEmail: email, actorType: "client", action: "login.blocked", details: { reason: user.status } });
    return NextResponse.json({ error: `Account is ${user.status}. Please contact support.` }, { status: 403 });
  }

  // Check soft-delete
  if (user.deletedAt) {
    return NextResponse.json({ error: "Account has been deactivated. Please contact support." }, { status: 403 });
  }

  const valid = await compare(password, user.password);
  if (!valid) {
    await logAudit({ actorId: user.id, actorEmail: email, actorType: "client", action: "login.failed", details: { reason: "invalid_password" } });
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createCopilotToken({
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
  });
  await setCopilotCookie(token);

  // Update last login
  await prisma.clientUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await logAudit({ actorId: user.id, actorEmail: email, actorType: "client", action: "login.success" });

  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, plan: user.plan } });
}

// DELETE /api/copilot/auth — logout
export async function DELETE() {
  await clearCopilotCookie();
  return NextResponse.json({ ok: true });
}
