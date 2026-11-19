import Redis from 'ioredis';
import env from '../config/env.js';

class InMemoryCache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value, ttlSeconds = 300) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
    // Evict old entries periodically if map grows large
    if (this.store.size > 2000) {
      const now = Date.now();
      for (const [k, v] of this.store.entries()) {
        if (now > v.expiresAt) this.store.delete(k);
      }
    }
  }

  del(key) {
    this.store.delete(key);
  }

  delPattern(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  flush() {
    this.store.clear();
  }
}

class CacheService {
  constructor() {
    this.inMemory = new InMemoryCache();
    this.redisClient = null;
    this.isRedisReady = false;

    const redisUrl = process.env.REDIS_URL || env.REDIS_URL;
    if (redisUrl) {
      try {
        this.redisClient = new Redis(redisUrl, {
          lazyConnect: true,
          retryStrategy: (times) => (times > 3 ? null : Math.min(times * 100, 1000)),
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false
        });

        this.redisClient.connect().then(() => {
          this.isRedisReady = true;
          console.log('⚡ Redis Cache connected successfully');
        }).catch(() => {
          this.isRedisReady = false;
          console.warn('⚠️  Redis unreachable, using resilient In-Memory Cache fallback');
        });

        this.redisClient.on('error', () => {
          this.isRedisReady = false;
        });

        this.redisClient.on('ready', () => {
          this.isRedisReady = true;
        });
      } catch {
        this.isRedisReady = false;
      }
    }
  }

  async get(key) {
    if (this.isRedisReady && this.redisClient) {
      try {
        const raw = await this.redisClient.get(key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return this.inMemory.get(key);
      }
    }
    return this.inMemory.get(key);
  }

  async set(key, value, ttlSeconds = 300) {
    if (this.isRedisReady && this.redisClient) {
      try {
        await this.redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return;
      } catch {
        // Fall back to memory
      }
    }
    this.inMemory.set(key, value, ttlSeconds);
  }

  async del(key) {
    if (this.isRedisReady && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch {
        // Fall back
      }
    }
    this.inMemory.del(key);
  }

  async delPattern(pattern) {
    if (this.isRedisReady && this.redisClient) {
      try {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      } catch {
        // Fall back
      }
    }
    this.inMemory.delPattern(pattern.replace('*', ''));
  }

  /**
   * Transparent Cache Wrapper:
   * Returns cached value if present; otherwise invokes fetcher, caches it for ttlSeconds, and returns it.
   */
  async wrap(key, fetcherFn, ttlSeconds = 300) {
    const cached = await this.get(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
    const fresh = await fetcherFn();
    if (fresh !== undefined && fresh !== null) {
      await this.set(key, fresh, ttlSeconds);
    }
    return fresh;
  }
}

export const cacheService = new CacheService();
export default cacheService;
