/**
 * Cache Service
 * Local data caching with TTL support
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export type CacheKey =
  | 'user_profile'
  | 'medical_profile'
  | 'emergency_contacts'
  | 'bracelet_status'
  | 'subscription'
  | 'recent_activities'
  | 'dashboard_stats'
  | 'invoices';

// Default TTL values (in milliseconds)
export const DEFAULT_TTL = {
  user_profile: 24 * 60 * 60 * 1000, // 24 hours
  medical_profile: 24 * 60 * 60 * 1000, // 24 hours
  emergency_contacts: 24 * 60 * 60 * 1000, // 24 hours
  bracelet_status: 1 * 60 * 60 * 1000, // 1 hour
  subscription: 6 * 60 * 60 * 1000, // 6 hours
  recent_activities: 30 * 60 * 1000, // 30 minutes
  dashboard_stats: 15 * 60 * 1000, // 15 minutes
  invoices: 24 * 60 * 60 * 1000, // 24 hours
};

const CACHE_PREFIX = '@medguard_cache_';

class CacheService {
  /**
   * Save data to cache with TTL
   */
  async saveToCache<T>(key: CacheKey, data: T, ttl?: number): Promise<void> {
    try {
      const cacheEntry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || DEFAULT_TTL[key] || 60 * 60 * 1000, // Default 1 hour
      };

      await AsyncStorage.setItem(
        `${CACHE_PREFIX}${key}`,
        JSON.stringify(cacheEntry)
      );

      console.log(`[Cache] Saved ${key} with TTL ${cacheEntry.ttl}ms`);
    } catch (error) {
      console.error(`[Cache] Error saving ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get data from cache if not expired
   */
  async getFromCache<T>(key: CacheKey): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);

      if (!cached) {
        console.log(`[Cache] Miss for ${key}`);
        return null;
      }

      const cacheEntry: CacheEntry<T> = JSON.parse(cached);
      const isExpired = this.isExpiredEntry(cacheEntry);

      if (isExpired) {
        console.log(`[Cache] Expired ${key}`);
        await this.clearCache(key);
        return null;
      }

      console.log(`[Cache] Hit for ${key}`);
      return cacheEntry.data;
    } catch (error) {
      console.error(`[Cache] Error getting ${key}:`, error);
      return null;
    }
  }

  /**
   * Check if cache entry is expired
   */
  async isExpired(key: CacheKey): Promise<boolean> {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);

      if (!cached) {
        return true;
      }

      const cacheEntry: CacheEntry = JSON.parse(cached);
      return this.isExpiredEntry(cacheEntry);
    } catch (error) {
      console.error(`[Cache] Error checking expiry for ${key}:`, error);
      return true;
    }
  }

  /**
   * Check if cache entry object is expired
   */
  private isExpiredEntry(entry: CacheEntry): boolean {
    const now = Date.now();
    const age = now - entry.timestamp;
    return age > entry.ttl;
  }

  /**
   * Get cache age in milliseconds
   */
  async getCacheAge(key: CacheKey): Promise<number | null> {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);

      if (!cached) {
        return null;
      }

      const cacheEntry: CacheEntry = JSON.parse(cached);
      return Date.now() - cacheEntry.timestamp;
    } catch (error) {
      console.error(`[Cache] Error getting cache age for ${key}:`, error);
      return null;
    }
  }

  /**
   * Get cache timestamp
   */
  async getCacheTimestamp(key: CacheKey): Promise<Date | null> {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);

      if (!cached) {
        return null;
      }

      const cacheEntry: CacheEntry = JSON.parse(cached);
      return new Date(cacheEntry.timestamp);
    } catch (error) {
      console.error(`[Cache] Error getting cache timestamp for ${key}:`, error);
      return null;
    }
  }

  /**
   * Clear specific cache entry
   */
  async clearCache(key: CacheKey): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
      console.log(`[Cache] Cleared ${key}`);
    } catch (error) {
      console.error(`[Cache] Error clearing ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all cache entries
   */
  async clearAllCache(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter((key) => key.startsWith(CACHE_PREFIX));

      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`[Cache] Cleared all cache (${cacheKeys.length} entries)`);
    } catch (error) {
      console.error('[Cache] Error clearing all cache:', error);
      throw error;
    }
  }

  /**
   * Get all cache keys
   */
  async getAllCacheKeys(): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      return allKeys
        .filter((key) => key.startsWith(CACHE_PREFIX))
        .map((key) => key.replace(CACHE_PREFIX, ''));
    } catch (error) {
      console.error('[Cache] Error getting cache keys:', error);
      return [];
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalEntries: number;
    expiredEntries: number;
    validEntries: number;
  }> {
    try {
      const keys = await this.getAllCacheKeys();
      const stats = {
        totalEntries: keys.length,
        expiredEntries: 0,
        validEntries: 0,
      };

      for (const key of keys) {
        const expired = await this.isExpired(key as CacheKey);
        if (expired) {
          stats.expiredEntries++;
        } else {
          stats.validEntries++;
        }
      }

      return stats;
    } catch (error) {
      console.error('[Cache] Error getting cache stats:', error);
      return { totalEntries: 0, expiredEntries: 0, validEntries: 0 };
    }
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpired(): Promise<number> {
    try {
      const keys = await this.getAllCacheKeys();
      let cleaned = 0;

      for (const key of keys) {
        const expired = await this.isExpired(key as CacheKey);
        if (expired) {
          await this.clearCache(key as CacheKey);
          cleaned++;
        }
      }

      console.log(`[Cache] Cleaned up ${cleaned} expired entries`);
      return cleaned;
    } catch (error) {
      console.error('[Cache] Error cleaning up expired cache:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();
