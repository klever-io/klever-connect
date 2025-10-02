import type { CacheOptions } from './types/provider'

/**
 * Simple in-memory cache with TTL support
 * @internal
 */
export class SimpleCache<T> {
  private cache = new Map<string, { value: T; expires: number }>()
  private readonly ttl: number
  private readonly maxSize: number

  constructor(options: CacheOptions) {
    this.ttl = options.ttl ?? 15000 // 15 seconds default (3-4 blocks)
    this.maxSize = options.maxSize ?? 100
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key)
    if (!item) return undefined

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return undefined
    }

    return item.value
  }

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

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }
}
