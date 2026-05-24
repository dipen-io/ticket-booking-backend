const { PrismaClient } = require("@prisma/client");
const { config } = require(".");
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString = process.env.DATABASE_URL;
const globalForPrisma = global;

const prisma = globalForPrisma.prisma ?? new PrismaClient({});

if (!globalForPrisma.prisma) {
  const adapter = new PrismaPg({ connectionString });

  globalForPrisma.prisma = new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });
}

if (config.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
