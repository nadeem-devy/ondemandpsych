import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const checks: Record<string, { status: string; latency?: number; details?: string }> = {};

  // Database check
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "healthy", latency: Date.now() - dbStart };
  } catch (err) {
    checks.database = { status: "unhealthy", latency: Date.now() - dbStart, details: String(err) };
  }

  // Stripe check
  if (process.env.STRIPE_SECRET_KEY) {
    checks.stripe = { status: "configured" };
  } else {
    checks.stripe = { status: "not_configured", details: "STRIPE_SECRET_KEY missing" };
  }

  // Email service check
  checks.email = { status: "dev_mode", details: "Using console logger. Configure email service for production." };

  // OTP service
  checks.otp = { status: "active" };

  // Memory usage
  const mem = process.memoryUsage();
  checks.memory = {
    status: "healthy",
    details: `RSS: ${(mem.rss / 1024 / 1024).toFixed(1)}MB, Heap: ${(mem.heapUsed / 1024 / 1024).toFixed(1)}/${(mem.heapTotal / 1024 / 1024).toFixed(1)}MB`,
  };

  // Uptime
  checks.uptime = {
    status: "healthy",
    details: `${(process.uptime() / 60).toFixed(1)} minutes`,
  };

  // Recent errors from audit log
  const recentErrors = await prisma.auditLog.count({
    where: {
      action: { contains: "error" },
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  checks.errors_24h = { status: recentErrors > 10 ? "warning" : "healthy", details: `${recentErrors} errors in last 24h` };

  // Failed OTPs
  const failedOtps = await prisma.otpCode.count({
    where: {
      attempts: { gte: 3 },
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  checks.otp_failures = { status: failedOtps > 5 ? "warning" : "healthy", details: `${failedOtps} failed OTPs in 24h` };

  const overallStatus = Object.values(checks).some((c) => c.status === "unhealthy") ? "unhealthy" : "healthy";

  return NextResponse.json({ status: overallStatus, checks, timestamp: new Date().toISOString() });
}
