import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@ondemandpsych.com";
  const password = "Admin@123"; // Change this after first login

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin user already exists:", email);
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name: "Super Admin",
      role: "superadmin",
      permissions: JSON.stringify(["users", "support", "content", "plans", "audit"]),
    },
  });

  console.log("Admin user created:", user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
