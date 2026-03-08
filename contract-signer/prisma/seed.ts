import { PrismaClient } from "../src/generated/prisma";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@netkyu.com" },
    update: {},
    create: {
      name: "NETkyu Admin",
      email: "admin@netkyu.com",
      passwordHash: hashSync("admin123", 10),
      role: "ADMIN",
    },
  });

  console.log("Seeded admin user:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
