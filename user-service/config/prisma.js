const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg"); // You need the 'pg' library pool
const { PrismaPg } = require("@prisma/adapter-pg");
const { config } = require("./index"); // Assuming this is where config.NODE_ENV lives

const globalForPrisma = global;

// 1. Only create a client if one doesn't exist globally
if (!globalForPrisma.prisma) {
    const connectionString = config.DATABASE_URL;

    // The Prisma Pg adapter expects a 'pg' Pool instance, not a raw string
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    globalForPrisma.prisma = new PrismaClient({
        adapter,
        log:
            config.NODE_ENV === "development"
                ? ["query", "error", "warn"]
                : ["error", "warn"],
    });
}

// 2. Extract the client to a local variable for exporting
const prisma = globalForPrisma.prisma;

module.exports = prisma;
