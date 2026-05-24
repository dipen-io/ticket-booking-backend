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

app.use(helmet());
app.use(corsMiddleware);
app.use(reqLogger);
app.use(cookieParser());

app.use(express.json());

app.use("/api/v1/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Hello from user-server  ");
});

app.get("/health", (req, res) => {
    res.status(200).json({
        message: "OK",
    });
});

app.use(errorHandler);

const startServer = async () => {
    try {
        logger.info(" Initializing services...");

        // singleton redis instance
        const redis = RedisClient.getInstance();

        // Boot both Prisma and Redis in parallel
        await Promise.all([
            // We wrap the ready check in a promise to ensure it's fully ready before proceeding
            new Promise((resolve, reject) => {
                if (redis.status === "ready") return resolve();
                redis.once("ready", resolve);
                redis.once("error", reject);
            }),
        ]);

        (prisma.$connect(),
            logger.info(
                " Database connected successfully via Prisma PgAdapter",
            ));

        const server = app.listen(config.PORT, async () => {
            logger.info(
                `${config.SERVICE_NAME} is running on http://localhost:${config.PORT}`,
            );
        });
    } catch (error) {
        logger.error("Failed to start server", error);
        process.exit(1);
    }
};

startServer();
