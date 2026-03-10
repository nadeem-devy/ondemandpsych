import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

/**
 * Generate a 6-digit OTP code.
 */
function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Create a new OTP for a user.
 */
export async function createOtp(params: {
  userId: string;
  email: string;
  phone?: string;
  type: "email_verify" | "login" | "password_reset";
}): Promise<{ code: string; expiresAt: Date }> {
  // Invalidate existing unused OTPs of the same type
  await prisma.otpCode.updateMany({
    where: { userId: params.userId, type: params.type, usedAt: null },
    data: { usedAt: new Date() },
  });

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: {
      userId: params.userId,
      email: params.email,
      phone: params.phone || null,
      code,
      type: params.type,
      expiresAt,
    },
  });

  return { code, expiresAt };
}

/**
 * Verify an OTP code.
 */
export async function verifyOtp(params: {
  email: string;
  code: string;
  type: "email_verify" | "login" | "password_reset";
}): Promise<{ valid: boolean; userId?: string; error?: string }> {
  const otp = await prisma.otpCode.findFirst({
    where: {
      email: params.email,
      code: params.code,
      type: params.type,
      usedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return { valid: false, error: "Invalid or expired code" };
  if (otp.expiresAt < new Date()) return { valid: false, error: "Code has expired" };
  if (otp.attempts >= otp.maxAttempts) return { valid: false, error: "Too many attempts" };

  // Mark as used
  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { usedAt: new Date() },
  });

  return { valid: true, userId: otp.userId };
}

/**
 * Increment attempt count on wrong code.
 */
export async function incrementOtpAttempt(email: string, type: string) {
  const otp = await prisma.otpCode.findFirst({
    where: { email, type, usedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (otp) {
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
  }
}
