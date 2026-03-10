import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOtp, verifyOtp, incrementOtpAttempt } from "@/lib/otp";
import { lifecycle } from "@/lib/email";
import { logAudit } from "@/lib/audit";

// POST — send or verify OTP
export async function POST(req: NextRequest) {
  const { action, email, code, type } = await req.json();

  if (action === "send") {
    if (!email || !type) return NextResponse.json({ error: "email and type required" }, { status: 400 });

    const user = await prisma.clientUser.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const otp = await createOtp({ userId: user.id, email, type });

    // Send OTP via email
    if (type === "email_verify") {
      await lifecycle.otpVerification(email, user.name, otp.code);
    } else if (type === "password_reset") {
      await lifecycle.passwordReset(email, user.name, otp.code);
    }

    await logAudit({
      actorId: user.id,
      actorEmail: email,
      actorType: "client",
      action: `otp.sent.${type}`,
      details: { expiresAt: otp.expiresAt.toISOString() },
    });

    return NextResponse.json({ sent: true, expiresAt: otp.expiresAt });
  }

  if (action === "verify") {
    if (!email || !code || !type) return NextResponse.json({ error: "email, code, and type required" }, { status: 400 });

    const result = await verifyOtp({ email, code, type });

    if (!result.valid) {
      await incrementOtpAttempt(email, type);
      await logAudit({
        actorId: "unknown",
        actorEmail: email,
        actorType: "client",
        action: `otp.failed.${type}`,
        details: { error: result.error },
      });
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // If email verification, mark user as verified
    if (type === "email_verify" && result.userId) {
      await prisma.clientUser.update({
        where: { id: result.userId },
        data: { emailVerified: true },
      });
    }

    await logAudit({
      actorId: result.userId || "unknown",
      actorEmail: email,
      actorType: "client",
      action: `otp.verified.${type}`,
    });

    return NextResponse.json({ verified: true, userId: result.userId });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
