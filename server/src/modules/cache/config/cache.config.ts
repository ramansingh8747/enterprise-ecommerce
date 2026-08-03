import { CacheProvider, CacheStrategy } from '../enums/cache.enums';
import {
  CACHE_PREFIX,
  DEFAULT_BATCH_SIZE,
  DEFAULT_TTL,
  MAX_TTL,
} from '../constants/cache.constants';

/**
 * Enterprise Caching Engine Configuration (Module 26.1 / 26.6).
 *
 * Strongly-typed options governing cache provider selection, default TTL,
 * namespace prefixes, batching limits, maximum entries, compression, and cleanup intervals.
 * Supports environment variable overrides with safe production fallbacks.
 */
export interface ICacheConfig {
  /** Master switch enabling or disabling the caching system. */
  enabled: boolean;

  /** Active cache provider type (MEMORY, REDIS, HYBRID). */
  provider: CacheProvider;

  /** Default caching strategy applied to operations. */
  defaultStrategy: CacheStrategy;

  /** Default time-to-live for cache entries in seconds. */
  defaultTTL: number;

  /** Maximum time-to-live limit for cache entries in seconds. */
  maxTTL: number;

  /** Maximum allowed stored entries in memory. */
  maxEntries: number;

  /** Global key namespace prefix. */
  namespacePrefix: string;

  /** Batch size limit for bulk cache operations. */
  batchSize: number;

  /** Whether payload compression is enabled for large entries. */
  compressionEnabled: boolean;

  /** Whether metrics and statistics gathering is enabled. */
  statisticsEnabled: boolean;

  /** In-memory cache cleanup interval in milliseconds (60 seconds). */
  cleanupIntervalMs: number;
}

/**
 * Default production-ready caching configuration with environment fallbacks.
 */
export const DEFAULT_CACHE_CONFIG: ICacheConfig = {
  enabled: process.env.CACHE_ENABLED !== 'false',
  provider: (process.env.CACHE_PROVIDER as CacheProvider) || CacheProvider.MEMORY,
  defaultStrategy: CacheStrategy.CACHE_FIRST,
  defaultTTL: process.env.CACHE_DEFAULT_TTL
    ? parseInt(process.env.CACHE_DEFAULT_TTL, 10)
    : DEFAULT_TTL,
  maxTTL: process.env.CACHE_MAX_TTL
    ? parseInt(process.env.CACHE_MAX_TTL, 10)
    : MAX_TTL,
  maxEntries: process.env.CACHE_MAX_ENTRIES
    ? parseInt(process.env.CACHE_MAX_ENTRIES, 10)
    : 10000,
  namespacePrefix: process.env.CACHE_PREFIX || CACHE_PREFIX,
  batchSize: process.env.CACHE_BATCH_SIZE
    ? parseInt(process.env.CACHE_BATCH_SIZE, 10)
    : DEFAULT_BATCH_SIZE,
  compressionEnabled: process.env.CACHE_COMPRESSION_ENABLED === 'true',
  statisticsEnabled: process.env.CACHE_STATISTICS_ENABLED !== 'false',
  cleanupIntervalMs: process.env.CACHE_CLEANUP_INTERVAL
    ? parseInt(process.env.CACHE_CLEANUP_INTERVAL, 10)
    : 60000,
};
