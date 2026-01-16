import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_OPTIONS } from './redis.constants';
import { CacheOptions, RedisModuleOptions } from './redis.interface';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: Redis;

  constructor(@Inject(REDIS_OPTIONS) private options: RedisModuleOptions) {}

  async onModuleInit() {

    this.redisClient = new Redis({
      host: this.options.host || 'localhost',
      port: this.options.port || 6379,
      username: this.options.username,
      password: this.options.password,
      db: this.options.db || 0,
      keyPrefix: this.options.keyPrefix || '',
      retryStrategy: this.options.retryStrategy || this.defaultRetryStrategy,
      lazyConnect: true,
    });

    this.redisClient.on('connect', () => {
      this.logger.log(`Redis client connected }`);
    });

    this.redisClient.on('ready', () => {
      this.logger.log(`Redis client ready (DB: ${this.options.db || 0}, Prefix: ${this.options.keyPrefix || 'none'})`);
    });

    this.redisClient.on('error', (error) => {
      this.logger.error(`Redis client error: ${error.message}`, error.stack);
    });

    this.redisClient.on('close', () => {
      this.logger.warn(`Redis client connection closed`);
    });

    this.redisClient.on('reconnecting', (delay: number) => {
      this.logger.log(`Redis client reconnecting (delay: ${delay}ms)...`);
    });

    try {
      await this.redisClient.connect();
      this.logger.log(`Successfully connected to Redis`);
    } catch (error) {
      this.logger.error(`Failed to connect to Redis:`, error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.logger.log('Redis client disconnected');
    }
  }

  /**
   * Get Redis client instance for advanced operations
   */
  getClient(): Redis {
    return this.redisClient;
  }

  /**
   * Get value by key
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Failed to get key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value with optional TTL (in seconds)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.redisClient.setex(key, ttl, serialized);
      } else {
        await this.redisClient.set(key, serialized);
      }
    } catch (error) {
      this.logger.error(`Failed to set key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete one or more keys
   */
  async del(...keys: string[]): Promise<number> {
    try {
      return await this.redisClient.del(...keys);
    } catch (error) {
      this.logger.error(`Failed to delete keys ${keys.join(', ')}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check key existence ${key}:`, error);
      return false;
    }
  }

  /**
   * Set expiration time on key (in seconds)
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.redisClient.expire(key, seconds);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to set expiration on key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get time to live for key (in seconds)
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redisClient.ttl(key);
    } catch (error) {
      this.logger.error(`Failed to get TTL for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Delete all keys matching a pattern (use with caution!)
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redisClient.keys(pattern);
      if (keys.length === 0) return 0;
      return await this.redisClient.del(...keys);
    } catch (error) {
      this.logger.error(`Failed to delete pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Get all keys matching a pattern
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.redisClient.keys(pattern);
    } catch (error) {
      this.logger.error(`Failed to get keys for pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Cache-aside pattern: Get from cache or execute function and cache result
   */
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    try {
      // Try to get from cache
      const cached = await this.get<T>(key);
      if (cached !== null) {
        this.logger.debug(`Cache hit for key: ${key}`);
        return cached;
      }

      // Cache miss - execute function
      this.logger.debug(`Cache miss for key: ${key}`);
      const result = await fn();

      // Store in cache
      if (result !== null && result !== undefined) {
        await this.set(key, result, options?.ttl);
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to getOrSet for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Increment value by 1
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.redisClient.incr(key);
    } catch (error) {
      this.logger.error(`Failed to increment key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Increment value by amount
   */
  async incrBy(key: string, amount: number): Promise<number> {
    try {
      return await this.redisClient.incrby(key, amount);
    } catch (error) {
      this.logger.error(`Failed to increment key ${key} by ${amount}:`, error);
      throw error;
    }
  }

  /**
   * Decrement value by 1
   */
  async decr(key: string): Promise<number> {
    try {
      return await this.redisClient.decr(key);
    } catch (error) {
      this.logger.error(`Failed to decrement key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Add members to a set
   */
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.redisClient.sadd(key, ...members);
    } catch (error) {
      this.logger.error(`Failed to add to set ${key}:`, error);
      return 0;
    }
  }

  /**
   * Get all members of a set
   */
  async smembers(key: string): Promise<string[]> {
    try {
      return await this.redisClient.smembers(key);
    } catch (error) {
      this.logger.error(`Failed to get members of set ${key}:`, error);
      return [];
    }
  }

  /**
   * Remove members from a set
   */
  async srem(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.redisClient.srem(key, ...members);
    } catch (error) {
      this.logger.error(`Failed to remove from set ${key}:`, error);
      return 0;
    }
  }

  /**
   * Check if member exists in set
   */
  async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.redisClient.sismember(key, member);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check member in set ${key}:`, error);
      return false;
    }
  }

  /**
   * Push value to list (right side)
   */
  async rpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.redisClient.rpush(key, ...values);
    } catch (error) {
      this.logger.error(`Failed to push to list ${key}:`, error);
      return 0;
    }
  }

  /**
   * Get list range
   */
  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.redisClient.lrange(key, start, stop);
    } catch (error) {
      this.logger.error(`Failed to get range from list ${key}:`, error);
      return [];
    }
  }

  /**
   * Set hash field
   */
  async hset(key: string, field: string, value: any): Promise<number> {
    try {
      const serialized = JSON.stringify(value);
      return await this.redisClient.hset(key, field, serialized);
    } catch (error) {
      this.logger.error(`Failed to set hash field ${key}:${field}:`, error);
      return 0;
    }
  }

  /**
   * Get hash field
   */
  async hget<T = any>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.redisClient.hget(key, field);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Failed to get hash field ${key}:${field}:`, error);
      return null;
    }
  }

  /**
   * Get all hash fields and values
   */
  async hgetall<T = any>(key: string): Promise<Record<string, T>> {
    try {
      const hash = await this.redisClient.hgetall(key);
      const result: Record<string, T> = {};
      
      for (const [field, value] of Object.entries(hash)) {
        try {
          result[field] = JSON.parse(value) as T;
        } catch {
          result[field] = value as any;
        }
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to get all hash fields for ${key}:`, error);
      return {};
    }
  }

  /**
   * Delete hash field
   */
  async hdel(key: string, ...fields: string[]): Promise<number> {
    try {
      return await this.redisClient.hdel(key, ...fields);
    } catch (error) {
      this.logger.error(`Failed to delete hash fields ${key}:`, error);
      return 0;
    }
  }

  /**
   * Flush all data (use with extreme caution!)
   */
  async flushall(): Promise<void> {
    try {
      await this.redisClient.flushall();
      this.logger.warn('All Redis data has been flushed!');
    } catch (error) {
      this.logger.error('Failed to flush all data:', error);
      throw error;
    }
  }

  /**
   * Default retry strategy
   */
  private defaultRetryStrategy(times: number): number {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
}
