import type Redis from "ioredis";

let client: Redis | null = null;
let connectPromise: Promise<Redis | null> | null = null;

/** Paylaşımlı Redis istemcisi — REDIS_URL yoksa null. */
export async function getRedisClient(): Promise<Redis | null> {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (!redisUrl) return null;

  if (client) return client;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    try {
      const { default: RedisCtor } = await import("ioredis");
      const next = new RedisCtor(redisUrl, {
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        enableOfflineQueue: false,
      });
      await next.connect();
      client = next;
      return client;
    } catch {
      return null;
    } finally {
      connectPromise = null;
    }
  })();

  return connectPromise;
}
