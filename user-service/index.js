const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { config } = require("./config");
const { logger } = require("./config/logger");
const { reqLogger } = require("./middlewares/req.middleware");
const errorHandler = require("./middlewares/error.middleware");
const { corsMiddleware } = require("./middlewares/cors.middleware");
const prisma = require("./config/prisma");
const RedisClient = require("./config/redis");

const authRoutes = require("./routes/auth.service");

const app = express();

// Middlewares
app.use(helmet());
app.use(corsMiddleware);
app.use(reqLogger);
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Hello from user-server");
});

app.get("/health", (req, res) => {
    res.status(200).json({
        message: "OK",
    });
});

// Global Error Handler (Must be at the very bottom of the middleware stack)
app.use(errorHandler);

const startServer = async () => {
    try {
        logger.info("Initializing services...");
        console.log("🔍 DEBUG - Current Config URL:", config.REDIS_URL);
        console.log("🔍 DEBUG - Process Env URL:", process.env.REDIS_URL);

        // Singleton redis instance
        const redis = RedisClient.getInstance();

        // FIXED: Boot both Prisma and Redis concurrently inside Promise.all
        await Promise.all([
            // 1. Prisma Connection
            prisma.$connect(),

            // 2. Redis Connection Event Wrapper
            new Promise((resolve, reject) => {
                if (redis.status === "ready") return resolve();
                redis.once("ready", resolve);
                redis.once("error", reject);
            }),
        ]);

        logger.info("🔌 Database connected successfully via Prisma PgAdapter");
        logger.info("⚡ Redis client is initialized and ready");

        // Start listening only AFTER dependencies are locked and loaded
        app.listen(config.PORT, () => {
            logger.info(
                `🚀 ${config.SERVICE_NAME} is running on http://localhost:${config.PORT}`,
            );
        });
    } catch (error) {
        logger.error("💥 Failed to start server during initialization:", error);
        process.exit(1);
    }
};

startServer();
