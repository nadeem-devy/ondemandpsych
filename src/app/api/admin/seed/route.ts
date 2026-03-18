import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Admin seed — creates admin if none exists, or resets password if admin exists
export async function GET() {
  const defaultEmail = "admin@ondemandpsych.com";
  const defaultPassword = "Admin@123";
  const hashed = await bcrypt.hash(defaultPassword, 12);

  const existing = await prisma.user.findUnique({
    where: { email: defaultEmail },
  });

  if (existing) {
    // Reset password for existing admin
    await prisma.user.update({
      where: { email: defaultEmail },
      data: { password: hashed, isActive: true },
    });

    return NextResponse.json({
      message: "Admin password reset successfully",
      email: defaultEmail,
      note: "Password has been reset to Admin@123 — change it immediately",
    });
  }

  const user = await prisma.user.create({
    data: {
      email: defaultEmail,
      password: hashed,
      name: "Super Admin",
      role: "superadmin",
      permissions: JSON.stringify(["users", "support", "content", "plans", "audit"]),
    },
  });

  return NextResponse.json({
    message: "Admin created successfully",
    email: user.email,
    note: "Default password is Admin@123 — change it immediately",
  });
}
