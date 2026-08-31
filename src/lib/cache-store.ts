/** Basit bellek önbelleği — REDIS_URL yoksa kullanılır. */
const store = new Map<string, { value: unknown; expires: number }>();

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (redisUrl) {
    try {
      const { default: Redis } = await import("ioredis");
      const client = new Redis(redisUrl, { maxRetriesPerRequest: 1, lazyConnect: true });
      await client.connect().catch(() => null);
      const raw = await client.get(key);
      await client.quit().catch(() => {});
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      /* Redis yoksa belleğe düş */
    }
  }

  const row = store.get(key);
  if (!row) return null;
  if (row.expires < Date.now()) {
    store.delete(key);
    return null;
  }
  return row.value as T;
}

export async function cacheSet(key: string, value: unknown, ttlSec = 60) {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (redisUrl) {
    try {
      const { default: Redis } = await import("ioredis");
      const client = new Redis(redisUrl, { maxRetriesPerRequest: 1, lazyConnect: true });
      await client.connect().catch(() => null);
      await client.set(key, JSON.stringify(value), "EX", ttlSec);
      await client.quit().catch(() => {});
      return;
    } catch {
      /* fallback */
    }
  }

  store.set(key, { value, expires: Date.now() + ttlSec * 1000 });
}

export async function cacheDel(key: string) {
  store.delete(key);
  const redisUrl = process.env.REDIS_URL?.trim();
  if (!redisUrl) return;
  try {
    const { default: Redis } = await import("ioredis");
    const client = new Redis(redisUrl, { maxRetriesPerRequest: 1, lazyConnect: true });
    await client.connect().catch(() => null);
    await client.del(key);
    await client.quit().catch(() => {});
  } catch {
    /* ignore */
  }
}
