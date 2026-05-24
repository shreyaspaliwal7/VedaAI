import IORedis from "ioredis";
import { env } from "./env";

export function createRedisConnection(): IORedis {
  const connection = new IORedis(env.redisUrl, {
    maxRetriesPerRequest: null,
  });

  connection.on("error", (err) => {
    console.error("Redis Connection Error:", err.message || err);
  });

  return connection;
}
