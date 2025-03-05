import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database setup...")

  // Create a demo user
  const hashedPassword = await hash("Password123!", 10)

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      password: hashedPassword,
    },
  })

  console.log(`Created demo user: ${user.email}`)
  console.log("Database setup completed successfully!")
}

main()
  .catch((e) => {
    console.error("Error during database setup:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

