import { RedisOptions } from 'ioredis';

export interface RedisModuleOptions extends RedisOptions {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  db?: number;
  keyPrefix?: string;
  retryStrategy?: (times: number) => number | void;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}
