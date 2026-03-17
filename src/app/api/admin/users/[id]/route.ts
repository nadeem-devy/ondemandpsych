import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { lifecycle } from "@/lib/email";
import { createOtp } from "@/lib/otp";

// GET /api/admin/users/[id] — get single user details
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const user = await prisma.clientUser.findUnique({
    where: { id },
    include: {
      chats: { select: { id: true, title: true, createdAt: true, updatedAt: true, _count: { select: { messages: true } } }, orderBy: { updatedAt: "desc" }, take: 20 },
      transactions: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get audit logs for this user
  const auditLogs = await prisma.auditLog.findMany({
    where: { OR: [{ targetId: id }, { actorId: id }] },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ user, auditLogs });
}

// PATCH /api/admin/users/[id] — update user
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.clientUser.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Allowed update fields
  const allowedFields = [
    "name", "status", "plan", "planExpiresAt", "trialMessageLimit",
    "tags", "notes", "role", "organization", "phone",
    "subscriptionStatus", "jurisdiction", "licenseNumber", "licenseVerified",
  ];

  const data: Record<string, unknown> = {};
  const changes: Record<string, { from: unknown; to: unknown }> = {};

  for (const field of allowedFields) {
    if (field in body && body[field] !== (existing as Record<string, unknown>)[field]) {
      data[field] = body[field];
      changes[field] = { from: (existing as Record<string, unknown>)[field], to: body[field] };
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No changes" }, { status: 400 });
  }

  const updated = await prisma.clientUser.update({ where: { id }, data });

  // Audit log
  await logAudit({
    actorId: session.user.id || "unknown",
    actorEmail: session.user.email || "unknown",
    actorType: "admin",
    action: "user.update",
    targetType: "ClientUser",
    targetId: id,
    details: changes,
  });

  return NextResponse.json({ user: updated });
}

// DELETE /api/admin/users/[id] — soft delete
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.clientUser.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.clientUser.update({
    where: { id },
    data: { deletedAt: new Date(), status: "deactivated", subscriptionStatus: "cancelled" },
  });

  await logAudit({
    actorId: session.user.id || "unknown",
    actorEmail: session.user.email || "unknown",
    actorType: "admin",
    action: "user.delete",
    targetType: "ClientUser",
    targetId: id,
    details: { email: existing.email, name: existing.name },
  });

  return NextResponse.json({ success: true });
}

// PUT /api/admin/users/[id] — admin actions (reset password, resend emails, override trial)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { action } = await req.json();

  const user = await prisma.clientUser.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  switch (action) {
    case "reset_password": {
      // Generate temp password and send email
      const tempPassword = Math.random().toString(36).slice(-10);
      const hashed = await hash(tempPassword, 12);
      await prisma.clientUser.update({ where: { id }, data: { password: hashed } });

      await lifecycle.passwordReset(user.email, user.name, tempPassword);

      await logAudit({
        actorId: session.user.id || "unknown",
        actorEmail: session.user.email || "unknown",
        actorType: "admin",
        action: "user.password_reset",
        targetType: "ClientUser",
        targetId: id,
      });

      return NextResponse.json({ success: true, message: "Password reset email sent" });
    }

    case "resend_welcome": {
      await lifecycle.welcome(user.email, user.name);
      await logAudit({
        actorId: session.user.id || "unknown",
        actorEmail: session.user.email || "unknown",
        actorType: "admin",
        action: "user.resend_welcome",
        targetType: "ClientUser",
        targetId: id,
      });
      return NextResponse.json({ success: true, message: "Welcome email resent" });
    }

    case "send_verification": {
      const otp = await createOtp({ userId: user.id, email: user.email, type: "email_verify" });
      await lifecycle.otpVerification(user.email, user.name, otp.code);
      await logAudit({
        actorId: session.user.id || "unknown",
        actorEmail: session.user.email || "unknown",
        actorType: "admin",
        action: "user.send_verification",
        targetType: "ClientUser",
        targetId: id,
      });
      return NextResponse.json({ success: true, message: "Verification email sent" });
    }

    case "reset_trial": {
      await prisma.clientUser.update({
        where: { id },
        data: { trialMessageCount: 0 },
      });
      await logAudit({
        actorId: session.user.id || "unknown",
        actorEmail: session.user.email || "unknown",
        actorType: "admin",
        action: "user.reset_trial",
        targetType: "ClientUser",
        targetId: id,
        details: { previousCount: user.trialMessageCount },
      });
      return NextResponse.json({ success: true, message: "Trial reset" });
    }

    case "suspend": {
      await prisma.clientUser.update({ where: { id }, data: { status: "suspended", subscriptionStatus: "cancelled" } });
      await logAudit({
        actorId: session.user.id || "unknown",
        actorEmail: session.user.email || "unknown",
        actorType: "admin",
        action: "user.suspend",
        targetType: "ClientUser",
        targetId: id,
      });
      return NextResponse.json({ success: true, message: "User suspended" });
    }

    case "activate": {
      await prisma.clientUser.update({ where: { id }, data: { status: "active", deletedAt: null } });
      await logAudit({
        actorId: session.user.id || "unknown",
        actorEmail: session.user.email || "unknown",
        actorType: "admin",
        action: "user.activate",
        targetType: "ClientUser",
        targetId: id,
      });
      return NextResponse.json({ success: true, message: "User activated" });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
