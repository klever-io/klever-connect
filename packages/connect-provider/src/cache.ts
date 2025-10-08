import type { CacheOptions } from './types/provider'

/**
 * Simple in-memory cache with TTL (time-to-live) and LRU (least-recently-used) eviction
 *
 * Features:
 * - Automatic expiration based on TTL
 * - LRU eviction when cache is full
 * - Configurable max size
 * - Generic type support
 *
 * @internal
 *
 * @example
 * ```typescript
 * const cache = new SimpleCache<UserData>({
 *   ttl: 15000,    // 15 seconds
 *   maxSize: 100   // Max 100 entries
 * })
 *
 * cache.set('user:123', userData)
 * const user = cache.get('user:123') // Returns userData
 *
 * // After 15 seconds
 * const expired = cache.get('user:123') // Returns undefined
 * ```
 */
export class SimpleCache<T> {
  private cache = new Map<string, { value: T; expires: number }>()
  private readonly ttl: number
  private readonly maxSize: number

  /**
   * Creates a new SimpleCache instance
   *
   * @param options - Cache configuration options
   * @param options.ttl - Time to live in milliseconds (default: 15000)
   * @param options.maxSize - Maximum number of entries (default: 100)
   */
  constructor(options: CacheOptions) {
    this.ttl = options.ttl ?? 15000 // 15 seconds default (3-4 blocks)
    this.maxSize = options.maxSize ?? 100
  }

  /**
   * Retrieves a value from the cache
   *
   * Returns undefined if:
   * - Key doesn't exist
   * - Entry has expired (also removes it)
   *
   * @param key - Cache key
   * @returns Cached value or undefined
   *
   * @example
   * ```typescript
   * const user = cache.get('user:123')
   * if (user) {
   *   console.log('Cache hit:', user)
   * } else {
   *   console.log('Cache miss or expired')
   * }
   * ```
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key)
    if (!item) return undefined

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return undefined
    }

    return item.value
  }

  /**
   * Stores a value in the cache with automatic expiration
   *
   * If cache is full and key doesn't exist, removes oldest entry (LRU eviction).
   * Updates expiration time if key already exists.
   *
   * @param key - Cache key
   * @param value - Value to cache
   *
   * @example
   * ```typescript
   * cache.set('user:123', { name: 'John', age: 30 })
   * cache.set('account:abc', accountData)
   * ```
   */
  set(key: string, value: T): void {
    // Implement simple LRU by removing oldest entries when at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      value,
      expires: Date.now() + this.ttl,
    })
  }

  /**
   * Removes all entries from the cache
   *
   * @example
   * ```typescript
   * cache.clear()
   * console.log('Cache cleared')
   * ```
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Removes a specific entry from the cache
   *
   * @param key - Cache key to remove
   * @returns true if entry was found and removed, false otherwise
   *
   * @example
   * ```typescript
   * const wasDeleted = cache.delete('user:123')
   * if (wasDeleted) {
   *   console.log('Entry removed')
   * }
   * ```
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }
}
