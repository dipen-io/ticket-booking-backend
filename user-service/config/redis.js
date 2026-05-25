const Redis = require("ioredis");
const { config } = require("./index");
const { logger } = require("./logger");

class RedisClient {
    static instance;
    static isConnected = false;

    constructor() {}

    static getInstance() {
        console.log("REDIS_URL:", config.REDIS_URL);
        if (!RedisClient.instance) {
            RedisClient.instance = new Redis(config.REDIS_URL, {
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                maxRetriesPerRequest: 3,
            });

            RedisClient.setupEventListeners();
        }
        return RedisClient.instance;
    }

    static setupEventListeners() {
        RedisClient.instance.on("connect", () => {
            RedisClient.isConnected = true;
            logger.info("Redis is connected");
        });

        RedisClient.instance.on("close", () => {
            RedisClient.isConnected = false;
            logger.warn("Redis connection closed");
        });

        RedisClient.instance.on("reconnecting", () => {
            logger.warn("Reconnecting to Redis..");
        });

        RedisClient.instance.on("ready", () => {
            RedisClient.isConnected = true;
            logger.warn("Redis client is ready");
        });

        RedisClient.instance.on("end", () => {
            logger.warn("Redis client is ready");
        });
    }
}

module.exports = RedisClient;
