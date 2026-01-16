export const REDIS_OPTIONS = 'REDIS_OPTIONS';
export const REDIS_CLIENT = 'REDIS_CLIENT';

// Default cache TTL values (in seconds)
export const CacheTTL = {
  ONE_MINUTE: 60,
  FIVE_MINUTES: 300,
  TEN_MINUTES: 600,
  THIRTY_MINUTES: 1800,
  ONE_HOUR: 3600,
  ONE_DAY: 86400,
  ONE_WEEK: 604800,
} as const;

// Cache key prefixes
export const CachePrefix = {
  RIDER: 'rider',
  USER: 'user',
  VENDOR: 'vendor',
  ORDER: 'order',
  MENU: 'menu',
  LOCATION: 'location',
  SESSION: 'session',
  RATE_LIMIT: 'rate_limit',
} as const;
