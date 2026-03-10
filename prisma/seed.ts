import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ondemandpsych.com" },
    update: {},
    create: {
      email: "admin@ondemandpsych.com",
      password,
      name: "Admin",
      role: "admin",
    },
  });

  console.log("Admin user created:", admin.email);
  console.log("Default password: admin123");
  console.log("⚠️  Change this password after first login!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
