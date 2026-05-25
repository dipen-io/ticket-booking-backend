require("dotenv").config();

const config = {
    SERVICE_NAME: require("../package.json").name,
    PORT: Number(process.env.PORT) || 4001,
    NODE_ENV: process.env.NODE_ENV || "development",
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
    REDIS_URL: process.env.REDIS_URL || "redis://:irctcpass@redis:6379",
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || "http://localhost:4000",
    OTP_TTL: process.env.OTP_TTL || 300,
    OTP_RATE_MAX_PER_HOUR: process.env.OTP_RATE_MAX_PER_HOUR || 5,
    OTP_MAX_VERIFY_ATTEMPTS: process.env.OTP_MAX_VERIFY_ATTEMPTS || 5,
    HMAC_SECRET: process.env.HMAC_SECRET || "hmac_secret",
    DATABASE_URL: process.env.DATABASE_URL,
};

module.exports = { config };
