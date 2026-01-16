# Redis Implementation Guide

## Overview
This document explains how Redis caching is implemented across the microservices architecture.

## Architecture

### Structure
```
libs/common/src/redis/
├── redis.module.ts          # Redis module configuration
├── redis.service.ts         # Redis service with helper methods
├── redis.constants.ts       # Cache TTL values and prefixes
├── redis.interface.ts       # TypeScript interfaces
├── cache-key.builder.ts     # Utility for consistent cache keys
└── index.ts                 # Export file
```

## Installation

### 1. Install Dependencies
```bash
npm install ioredis
npm install --save-dev @types/ioredis
```

### 2. Install Redis Server

#### Windows (using WSL2):
```bash
# Install WSL2 if not installed
wsl --install

# Inside WSL, install Redis
sudo apt update
sudo apt install redis-server

# Start Redis
sudo service redis-server start

# Test connection
redis-cli ping
# Should return: PONG
```

#### macOS (using Homebrew):
```bash
brew install redis
brew services start redis
```

#### Docker:
```bash
docker run --name redis-cache -p 6379:6379 -d redis:alpine
```

## Configuration

### 1. Environment Variables

Add to each service's `.env` or `.env.example`:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_KEY_PREFIX=service-name:
```

### 2. Module Setup

In your service module (e.g., `rider-service.module.ts`):

```typescript
import { RedisModule } from '@chidi-food-delivery/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/your-service/.env',
    }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
        password: configService.get<string>('REDIS_PASSWORD'),
        db: configService.get<number>('REDIS_DB', 0),
        keyPrefix: configService.get<string>('REDIS_KEY_PREFIX'),
      }),
      inject: [ConfigService],
    }),
    // ... other imports
  ],
})
export class YourServiceModule {}
```

## Usage Examples

### 1. Basic Cache Operations

```typescript
import { RedisService, CacheKeyBuilder, CacheTTL } from '@chidi-food-delivery/common';

@Injectable()
export class MyService {
  constructor(private readonly redisService: RedisService) {}

  // Simple get/set
  async cacheExample() {
    // Set value with TTL
    await this.redisService.set('my-key', { data: 'value' }, CacheTTL.FIVE_MINUTES);

    // Get value
    const value = await this.redisService.get<any>('my-key');

    // Delete value
    await this.redisService.del('my-key');
  }
}
```

### 2. Cache-Aside Pattern (Recommended)

```typescript
async getRiderById(riderId: string): Promise<Rider> {
  const cacheKey = CacheKeyBuilder.rider.byId(riderId);

  // Automatically checks cache, fetches from DB if miss, then caches result
  return await this.redisService.getOrSet(
    cacheKey,
    async () => {
      // This function only runs on cache miss
      return await this.riderRepository.findById(riderId);
    },
    { ttl: CacheTTL.FIVE_MINUTES },
  );
}
```

### 3. Manual Cache Management

```typescript
async getRiderProfile(id: string): Promise<Rider> {
  const cacheKey = CacheKeyBuilder.rider.profile(id);

  // Try cache first
  const cached = await this.redisService.get<Rider>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from database
  const rider = await this.riderRepository.findOne({ _id: id });
  
  // Store in cache
  await this.redisService.set(cacheKey, rider, CacheTTL.TEN_MINUTES);
  
  return rider;
}
```

### 4. Cache Invalidation

```typescript
async updateRiderProfile(riderId: string, data: any): Promise<Rider> {
  // Update database
  const updated = await this.riderRepository.update(riderId, data);

  // Invalidate related cache entries
  await this.invalidateRiderCache(riderId);

  return updated;
}

private async invalidateRiderCache(riderId: string): Promise<void> {
  await Promise.all([
    this.redisService.del(CacheKeyBuilder.rider.byId(riderId)),
    this.redisService.del(CacheKeyBuilder.rider.profile(riderId)),
    this.redisService.del(CacheKeyBuilder.rider.availableRiders()),
  ]);
}
```

### 5. Pattern-Based Deletion

```typescript
// Delete all keys matching a pattern
await this.redisService.delPattern('rider:*');
await this.redisService.delPattern('rider:nearby:*');
```

### 6. Advanced Redis Operations

```typescript
// Sets (for collections)
await this.redisService.sadd('active-riders', rider1.id, rider2.id);
const activeRiders = await this.redisService.smembers('active-riders');

// Hashes (for structured data)
await this.redisService.hset('rider:123', 'status', 'active');
const status = await this.redisService.hget('rider:123', 'status');

// Counters
await this.redisService.incr('order-count');
const count = await this.redisService.incrBy('order-count', 5);

// Lists (for queues)
await this.redisService.rpush('pending-orders', order1, order2);
const orders = await this.redisService.lrange('pending-orders', 0, -1);
```

## Cache Key Builder

Use `CacheKeyBuilder` for consistent key naming:

```typescript
import { CacheKeyBuilder } from '@chidi-food-delivery/common';

// Rider keys
CacheKeyBuilder.rider.byId(riderId)                    // rider:123
CacheKeyBuilder.rider.profile(riderId)                 // rider:123:profile
CacheKeyBuilder.rider.location(riderId)                // location:rider:123
CacheKeyBuilder.rider.availableRiders()                // rider:available
CacheKeyBuilder.rider.nearbyRiders(lat, lng, radius)  // rider:nearby:12.345:67.890:5000

// User keys
CacheKeyBuilder.user.byId(userId)                      // user:123
CacheKeyBuilder.user.byEmail(email)                    // user:email:test@example.com

// Order keys
CacheKeyBuilder.order.byId(orderId)                    // order:123
CacheKeyBuilder.order.byUser(userId)                   // order:user:123

// Custom keys
CacheKeyBuilder.build('custom', 'key', 123)            // custom:key:123
```

## Cache TTL Constants

```typescript
import { CacheTTL } from '@chidi-food-delivery/common';

CacheTTL.ONE_MINUTE      // 60 seconds
CacheTTL.FIVE_MINUTES    // 300 seconds
CacheTTL.TEN_MINUTES     // 600 seconds
CacheTTL.THIRTY_MINUTES  // 1800 seconds
CacheTTL.ONE_HOUR        // 3600 seconds
CacheTTL.ONE_DAY         // 86400 seconds
CacheTTL.ONE_WEEK        // 604800 seconds
```

## Caching Strategy Recommendations

### What to Cache

| Data Type | TTL | Invalidation Strategy |
|-----------|-----|----------------------|
| User/Rider/Vendor profiles | 5-10 minutes | On update |
| Menu items | 30 minutes | On menu change |
| Available riders | 30 seconds | On status change |
| Nearby riders | 1 minute | On location update |
| Order details | 2 minutes | On order update |
| Session tokens | Until expiry | On logout |

### What NOT to Cache

- Sensitive data (passwords, payment info)
- Real-time critical data (active order status)
- Rapidly changing data (live location updates)
- Large binary data (images, files)

## Best Practices

### 1. Always Set TTL
```typescript
// ❌ Bad: No TTL (data lives forever)
await this.redisService.set('key', data);

// ✅ Good: With TTL
await this.redisService.set('key', data, CacheTTL.FIVE_MINUTES);
```

### 2. Handle Cache Failures Gracefully
```typescript
async getRider(id: string): Promise<Rider> {
  try {
    const cached = await this.redisService.get<Rider>(CacheKeyBuilder.rider.byId(id));
    if (cached) return cached;
  } catch (error) {
    // Log but continue - don't let cache failure break the app
    this.logger.warn('Cache read failed, fetching from DB', error);
  }

  // Always fall back to database
  return await this.riderRepository.findById(id);
}
```

### 3. Invalidate on Updates
```typescript
async updateRider(id: string, data: any): Promise<Rider> {
  const updated = await this.riderRepository.update(id, data);
  
  // Always invalidate related cache
  await this.redisService.del(CacheKeyBuilder.rider.byId(id));
  
  return updated;
}
```

### 4. Use Consistent Key Naming
```typescript
// ❌ Bad: Inconsistent keys
await this.redisService.set(`rider_${id}`, data);
await this.redisService.set(`rider-${id}-profile`, data);

// ✅ Good: Use CacheKeyBuilder
await this.redisService.set(CacheKeyBuilder.rider.byId(id), data);
await this.redisService.set(CacheKeyBuilder.rider.profile(id), data);
```

### 5. Monitor Cache Performance
```typescript
// Add logging for cache hits/misses
const cached = await this.redisService.get(key);
if (cached) {
  this.logger.debug(`Cache HIT: ${key}`);
  return cached;
} else {
  this.logger.debug(`Cache MISS: ${key}`);
}
```

## Testing

### Test Redis Connection
```bash
# Windows (in WSL)
redis-cli ping

# Check if running
redis-cli info server

# Monitor commands in real-time
redis-cli monitor

# Check cached keys
redis-cli keys "*"

# Get a specific key
redis-cli get "rider-service:rider:123"

# Flush all data (CAUTION!)
redis-cli flushall
```

### Test in Application
```typescript
// Add a test endpoint in your controller
@Get('test-redis')
async testRedis() {
  await this.redisService.set('test-key', { data: 'Hello Redis!' }, 60);
  const value = await this.redisService.get('test-key');
  return value;
}
```

## Troubleshooting

### Redis Connection Issues

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solutions:**
1. Check if Redis is running: `redis-cli ping`
2. Start Redis: `sudo service redis-server start` (Linux/WSL)
3. Check port: Ensure Redis is on 6379
4. Check firewall settings

### Memory Issues

**Problem:** Redis running out of memory

**Solutions:**
1. Set maxmemory in Redis config
2. Use shorter TTLs
3. Implement eviction policies
4. Monitor memory usage: `redis-cli info memory`

### Cache Inconsistency

**Problem:** Cached data doesn't match database

**Solutions:**
1. Always invalidate cache on updates
2. Use shorter TTLs for frequently changing data
3. Implement cache warming strategies
4. Use versioning in cache keys

## Production Considerations

### 1. Redis Configuration

```conf
# redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
timeout 300
tcp-keepalive 60
```

### 2. High Availability

Consider Redis Sentinel or Redis Cluster for production:

```typescript
RedisModule.forRoot({
  sentinels: [
    { host: 'sentinel1', port: 26379 },
    { host: 'sentinel2', port: 26379 },
  ],
  name: 'mymaster',
})
```

### 3. Monitoring

- Monitor cache hit/miss ratios
- Track memory usage
- Set up alerts for connection failures
- Log slow queries

### 4. Security

```env
# Use strong passwords
REDIS_PASSWORD=your-strong-password

# Bind to specific interface in production
REDIS_HOST=10.0.0.5

# Use SSL/TLS for remote connections
```

## Migration from In-Memory to Redis

If migrating from in-memory cache:

1. Install Redis and dependencies
2. Update module configuration
3. Test in development
4. Deploy to staging
5. Monitor performance
6. Deploy to production

No code changes needed in services - the `RedisService` API is compatible!

## Additional Resources

- [Redis Documentation](https://redis.io/documentation)
- [ioredis GitHub](https://github.com/luin/ioredis)
- [Redis Best Practices](https://redis.io/topics/memory-optimization)
- [Caching Strategies](https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/caching-patterns.html)
