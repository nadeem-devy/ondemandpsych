import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// One-time admin seed endpoint — only works if no admin users exist
export async function POST(req: Request) {
  const { secret } = await req.json();

  if (secret !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingAdmin = await prisma.user.findFirst();
  if (existingAdmin) {
    return NextResponse.json({ error: "Admin user already exists" }, { status: 400 });
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
    message: "Admin created",
    email: user.email,
    note: "Default password is Admin@123 — change it immediately",
  });
}
