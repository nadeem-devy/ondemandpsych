import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// One-time admin seed — self-protecting: only works if zero users exist
export async function GET() {
  const count = await prisma.user.count();
  if (count > 0) {
    return NextResponse.json({ error: "Admin already exists. Seed disabled." }, { status: 400 });
  }

  const hashed = await bcrypt.hash("Admin@123", 12);
  const user = await prisma.user.create({
    data: {
      email: "admin@ondemandpsych.com",
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
