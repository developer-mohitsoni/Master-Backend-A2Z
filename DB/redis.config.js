import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

redis.on("error", (err) => console.error("Redis error:", err));

export default redis;
