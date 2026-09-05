import Redis from 'ioredis';

export type RedisValue = string | number | boolean | Record<string, any> | null;
type LocalEntry = { value: RedisValue; expiresAt?: number };

export class RedisStore {
  private store = new Map<string, LocalEntry>();
  private readonly client?: Redis;

  constructor() {
    if (process.env.REDIS_URL) this.client = new Redis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
  }

  private localValue(key: string) {
    const entry = this.store.get(key);
    if (entry?.expiresAt && entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry?.value ?? null;
  }

  async set(key: string, value: RedisValue, ttlSeconds?: number): Promise<void> {
    if (this.client) {
      const client = this.client as any;
      if (ttlSeconds) await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      else await client.set(key, JSON.stringify(value));
      return;
    }
    this.store.set(key, { value, expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined });
  }

  async setIfNotExists(key: string, value: RedisValue, ttlSeconds = 30): Promise<boolean> {
    if (this.client) return (await (this.client as any).set(key, JSON.stringify(value), 'NX', 'EX', ttlSeconds)) === 'OK';
    if (this.localValue(key) !== null) return false;
    await this.set(key, value, ttlSeconds);
    return true;
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (this.client) {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) as T : null;
    }
    return this.localValue(key) as T | null;
  }

  async del(key: string): Promise<void> {
    if (this.client) { await this.client.del(key); return; }
    this.store.delete(key);
  }

  async hset(hash: string, values: Record<string, any>): Promise<void> {
    const current = (await this.get<Record<string, any>>(hash)) || {};
    await this.set(hash, { ...current, ...values });
  }

  async hget<T = any>(hash: string, field?: string): Promise<T | null> {
    const current = (await this.get<Record<string, any>>(hash)) || {};
    if (field) return (current[field] as T) ?? null;
    return (current as T) ?? null;
  }

  async keys(pattern = '*'): Promise<string[]> {
    if (this.client) return this.client.keys(pattern);
    const regex = new RegExp(`^${pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
    return Array.from(this.store.keys()).filter((k) => this.localValue(k) !== null && regex.test(k));
  }

  async exists(key: string): Promise<boolean> {
    if (this.client) return (await this.client.exists(key)) === 1;
    return this.localValue(key) !== null;
  }

  async flushAll(): Promise<void> {
    if (this.client) { await this.client.flushdb(); return; }
    this.store.clear();
  }
}

export const redisStore = new RedisStore();
