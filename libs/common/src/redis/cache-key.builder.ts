import { CachePrefix } from './redis.constants';

/**
 * Utility class for generating consistent cache keys
 */
export class CacheKeyBuilder {
  /**
   * Build a cache key with prefix and identifier
   */
    static build(prefix: string, ...parts: (string | number)[]): string {
        return [prefix, ...parts].join(':');
    }

  /**
   * Rider cache keys
   */
  static rider = {
    byId: (riderId: string) => CacheKeyBuilder.build(CachePrefix.RIDER, riderId),
    profile: (riderId: string) => CacheKeyBuilder.build(CachePrefix.RIDER, riderId, 'profile'),
    location: (riderId: string) => CacheKeyBuilder.build(CachePrefix.LOCATION, 'rider', riderId),
    availableRiders: () => CacheKeyBuilder.build(CachePrefix.RIDER, 'available'),
    nearbyRiders: (lat: number, lng: number, radius: number) => {
      // Round coordinates to 3 decimal places (~111m precision)
      const roundedLat = Math.round(lat * 1000) / 1000;
      const roundedLng = Math.round(lng * 1000) / 1000;
      return CacheKeyBuilder.build(CachePrefix.RIDER, 'nearby', roundedLat, roundedLng, radius);
    },
    allPattern: () => `${CachePrefix.RIDER}:*`,
  };

  /**
   * User cache keys
   */
  static user = {
    byId: (userId: string) => CacheKeyBuilder.build(CachePrefix.USER, userId),
    profile: (userId: string) => CacheKeyBuilder.build(CachePrefix.USER, userId, 'profile'),
    byEmail: (email: string) => CacheKeyBuilder.build(CachePrefix.USER, 'email', email),
    byPhone: (phone: string) => CacheKeyBuilder.build(CachePrefix.USER, 'phone', phone),
    allPattern: () => `${CachePrefix.USER}:*`,
  };

  /**
   * Vendor cache keys
   */
  static vendor = {
    byId: (vendorId: string) => CacheKeyBuilder.build(CachePrefix.VENDOR, vendorId),
    profile: (vendorId: string) => CacheKeyBuilder.build(CachePrefix.VENDOR, vendorId, 'profile'),
    menu: (vendorId: string) => CacheKeyBuilder.build(CachePrefix.MENU, vendorId),
    allPattern: () => `${CachePrefix.VENDOR}:*`,
  };

  /**
   * Order cache keys
   */
  static order = {
    byId: (orderId: string) => CacheKeyBuilder.build(CachePrefix.ORDER, orderId),
    byUser: (userId: string) => CacheKeyBuilder.build(CachePrefix.ORDER, 'user', userId),
    byRider: (riderId: string) => CacheKeyBuilder.build(CachePrefix.ORDER, 'rider', riderId),
    byVendor: (vendorId: string) => CacheKeyBuilder.build(CachePrefix.ORDER, 'vendor', vendorId),
    activeOrders: () => CacheKeyBuilder.build(CachePrefix.ORDER, 'active'),
    allPattern: () => `${CachePrefix.ORDER}:*`,
  };

  /**
   * Session cache keys
   */
  static session = {
    byToken: (token: string) => CacheKeyBuilder.build(CachePrefix.SESSION, token),
    byUserId: (userId: string) => CacheKeyBuilder.build(CachePrefix.SESSION, 'user', userId),
    allPattern: () => `${CachePrefix.SESSION}:*`,
  };

  /**
   * Rate limiting keys
   */
  static rateLimit = {
    byIp: (ip: string, endpoint: string) => 
      CacheKeyBuilder.build(CachePrefix.RATE_LIMIT, 'ip', ip, endpoint),
    byUser: (userId: string, endpoint: string) => 
      CacheKeyBuilder.build(CachePrefix.RATE_LIMIT, 'user', userId, endpoint),
  };

  /**
   * Menu cache keys
   */
  static menu = {
    items: (vendorId: string) => CacheKeyBuilder.build(CachePrefix.MENU, vendorId, 'items'),
    item: (vendorId: string, itemId: string) => 
      CacheKeyBuilder.build(CachePrefix.MENU, vendorId, 'item', itemId),
    categories: (vendorId: string) => 
      CacheKeyBuilder.build(CachePrefix.MENU, vendorId, 'categories'),
    allPattern: () => `${CachePrefix.MENU}:*`,
  };
}
