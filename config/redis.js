const Redis = require("ioredis");
const { config } = require(".");
const logger = require("./logger");

class RedisClient {
  static instance;
  static isConnected = false;

  constructor() {}

  static getInstance() {
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
      logger.warn("Redis is connected");
    });

    RedisClient.instance.on("close", () => {
      RedisClient.isConnected = false;
      logger.warn("Redis connection closed");
    });

    RedisClient.instance.on("reconnecting", () => {
      logger.warn("Reconnecting to Redis..");
    });

    RedisClient.instance.on("ready", () => {
      logger.warn("Redis client is ready");
    });

    RedisClient.instance.on("end", () => {
      logger.warn("Redis client is ready");
    });
  }
}
