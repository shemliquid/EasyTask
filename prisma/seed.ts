import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const taPassword = await hash("ta123", 10);
  const lecturerPassword = await hash("lecturer123", 10);

  await prisma.user.upsert({
    where: { email: "ta@easytask.edu" },
    update: {},
    create: {
      email: "ta@easytask.edu",
      password: taPassword,
      role: "TA",
      name: "Teaching Assistant",
    },
  });

  await prisma.user.upsert({
    where: { email: "lecturer@easytask.edu" },
    update: {},
    create: {
      email: "lecturer@easytask.edu",
      password: lecturerPassword,
      role: "LECTURER",
      name: "Lecturer",
    },
  });

  console.log("Seed complete. Use ta@easytask.edu / ta123 or lecturer@easytask.edu / lecturer123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
