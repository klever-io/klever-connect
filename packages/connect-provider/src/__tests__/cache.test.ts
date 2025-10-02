import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SimpleCache } from '../cache'

describe('SimpleCache', () => {
  let cache: SimpleCache<string>

  beforeEach(() => {
    vi.useFakeTimers()
    cache = new SimpleCache({ ttl: 1000, maxSize: 3 })
  })

  describe('constructor', () => {
    it('should create cache with default ttl', () => {
      const defaultCache = new SimpleCache({})
      defaultCache.set('key', 'value')
      expect(defaultCache.get('key')).toBe('value')
    })

    it('should create cache with custom ttl and maxSize', () => {
      const customCache = new SimpleCache({ ttl: 500, maxSize: 5 })
      customCache.set('key', 'value')
      expect(customCache.get('key')).toBe('value')
    })
  })

  describe('get and set', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })

    it('should return undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined()
    })

    it('should update existing values', () => {
      cache.set('key1', 'value1')
      cache.set('key1', 'value2')
      expect(cache.get('key1')).toBe('value2')
    })
  })

  describe('TTL expiration', () => {
    it('should return value before expiration', () => {
      cache.set('key1', 'value1')
      vi.advanceTimersByTime(500) // Half of TTL
      expect(cache.get('key1')).toBe('value1')
    })

    it('should return undefined after expiration', () => {
      cache.set('key1', 'value1')
      vi.advanceTimersByTime(1001) // Past TTL
      expect(cache.get('key1')).toBeUndefined()
    })

    it('should remove expired entries on access', () => {
      cache.set('key1', 'value1')
      vi.advanceTimersByTime(1001)
      cache.get('key1') // This should trigger removal
      expect(cache.get('key1')).toBeUndefined()
    })
  })

  describe('maxSize limit (LRU behavior)', () => {
    it('should store up to maxSize entries', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      expect(cache.get('key1')).toBe('value1')
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key3')).toBe('value3')
    })

    it('should evict oldest entry when maxSize is exceeded', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      cache.set('key4', 'value4') // This should evict key1

      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key3')).toBe('value3')
      expect(cache.get('key4')).toBe('value4')
    })

    it('should not evict when updating existing key', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      cache.set('key1', 'updated1') // Update existing key

      expect(cache.get('key1')).toBe('updated1')
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key3')).toBe('value3')
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.clear()
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBeUndefined()
    })
  })

  describe('delete', () => {
    it('should remove specific entry', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      const deleted = cache.delete('key1')

      expect(deleted).toBe(true)
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBe('value2')
    })

    it('should return false for non-existent key', () => {
      const deleted = cache.delete('nonexistent')
      expect(deleted).toBe(false)
    })
  })

  describe('complex types', () => {
    it('should handle object values', () => {
      const objCache = new SimpleCache<{ name: string; age: number }>({ ttl: 1000 })
      const value = { name: 'John', age: 30 }
      objCache.set('user', value)
      expect(objCache.get('user')).toEqual(value)
    })

    it('should handle array values', () => {
      const arrCache = new SimpleCache<number[]>({ ttl: 1000 })
      const value = [1, 2, 3, 4, 5]
      arrCache.set('numbers', value)
      expect(arrCache.get('numbers')).toEqual(value)
    })
  })
})
