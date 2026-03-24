import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TypedEventEmitter } from '../event-emitter'

// ---------------------------------------------------------------------------
// Test event map
// ---------------------------------------------------------------------------

interface TestEvents {
  block: { blockNumber: number; hash: string }
  error: { code: string; message: string }
  connect: undefined
  data: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEmitter() {
  return new TypedEventEmitter<TestEvents>()
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TypedEventEmitter', () => {
  describe('on / off', () => {
    it('calls listener when event is emitted', () => {
      const emitter = makeEmitter()
      const listener = vi.fn()

      emitter.on('block', listener)
      emitter.emit('block', { blockNumber: 1, hash: 'abc' })

      expect(listener).toHaveBeenCalledOnce()
      expect(listener).toHaveBeenCalledWith({ blockNumber: 1, hash: 'abc' })
    })

    it('calls multiple listeners for the same event', () => {
      const emitter = makeEmitter()
      const l1 = vi.fn()
      const l2 = vi.fn()

      emitter.on('block', l1)
      emitter.on('block', l2)
      emitter.emit('block', { blockNumber: 2, hash: 'def' })

      expect(l1).toHaveBeenCalledOnce()
      expect(l2).toHaveBeenCalledOnce()
    })

    it('does not call listener after off()', () => {
      const emitter = makeEmitter()
      const listener = vi.fn()

      emitter.on('block', listener)
      emitter.off('block', listener)
      emitter.emit('block', { blockNumber: 3, hash: 'ghi' })

      expect(listener).not.toHaveBeenCalled()
    })

    it('off() is a no-op when listener is not registered', () => {
      const emitter = makeEmitter()
      const listener = vi.fn()

      // Should not throw
      expect(() => emitter.off('block', listener)).not.toThrow()
    })

    it('off() only removes the specific listener reference', () => {
      const emitter = makeEmitter()
      const l1 = vi.fn()
      const l2 = vi.fn()

      emitter.on('block', l1)
      emitter.on('block', l2)
      emitter.off('block', l1)
      emitter.emit('block', { blockNumber: 4, hash: 'jkl' })

      expect(l1).not.toHaveBeenCalled()
      expect(l2).toHaveBeenCalledOnce()
    })

    it('returns this for chaining', () => {
      const emitter = makeEmitter()
      const listener = vi.fn()

      const result = emitter.on('block', listener)
      expect(result).toBe(emitter)

      const result2 = emitter.off('block', listener)
      expect(result2).toBe(emitter)
    })
  })

  describe('once', () => {
    it('calls listener exactly once', () => {
      const emitter = makeEmitter()
      const listener = vi.fn()

      emitter.once('block', listener)
      emitter.emit('block', { blockNumber: 1, hash: 'a' })
      emitter.emit('block', { blockNumber: 2, hash: 'b' })
      emitter.emit('block', { blockNumber: 3, hash: 'c' })

      expect(listener).toHaveBeenCalledOnce()
      expect(listener).toHaveBeenCalledWith({ blockNumber: 1, hash: 'a' })
    })

    it('removes once listener after first emit without affecting other listeners', () => {
      const emitter = makeEmitter()
      const onceListener = vi.fn()
      const persistentListener = vi.fn()

      emitter.once('block', onceListener)
      emitter.on('block', persistentListener)

      emitter.emit('block', { blockNumber: 1, hash: 'x' })
      emitter.emit('block', { blockNumber: 2, hash: 'y' })

      expect(onceListener).toHaveBeenCalledOnce()
      expect(persistentListener).toHaveBeenCalledTimes(2)
    })

    it('multiple once listeners each fire exactly once', () => {
      const emitter = makeEmitter()
      const l1 = vi.fn()
      const l2 = vi.fn()
      const l3 = vi.fn()

      emitter.once('block', l1)
      emitter.once('block', l2)
      emitter.once('block', l3)

      emitter.emit('block', { blockNumber: 1, hash: 'a' })
      // All three fire on the first emit
      expect(l1).toHaveBeenCalledOnce()
      expect(l2).toHaveBeenCalledOnce()
      expect(l3).toHaveBeenCalledOnce()

      emitter.emit('block', { blockNumber: 2, hash: 'b' })
      // None fire on the second emit — all were auto-removed
      expect(l1).toHaveBeenCalledOnce()
      expect(l2).toHaveBeenCalledOnce()
      expect(l3).toHaveBeenCalledOnce()
    })

    it('returns this for chaining', () => {
      const emitter = makeEmitter()
      const listener = vi.fn()
      expect(emitter.once('block', listener)).toBe(emitter)
    })
  })

  describe('removeAllListeners', () => {
    it('removes all listeners for a specific event', () => {
      const emitter = makeEmitter()
      const l1 = vi.fn()
      const l2 = vi.fn()
      const other = vi.fn()

      emitter.on('block', l1)
      emitter.on('block', l2)
      emitter.on('error', other)
      emitter.removeAllListeners('block')

      emitter.emit('block', { blockNumber: 1, hash: 'z' })
      emitter.emit('error', { code: 'E', message: 'test' })

      expect(l1).not.toHaveBeenCalled()
      expect(l2).not.toHaveBeenCalled()
      expect(other).toHaveBeenCalledOnce()
    })

    it('removes all listeners for all events when called without argument', () => {
      const emitter = makeEmitter()
      const blockListener = vi.fn()
      const errorListener = vi.fn()

      emitter.on('block', blockListener)
      emitter.on('error', errorListener)
      emitter.removeAllListeners()

      emitter.emit('block', { blockNumber: 1, hash: '' })
      emitter.emit('error', { code: 'E', message: '' })

      expect(blockListener).not.toHaveBeenCalled()
      expect(errorListener).not.toHaveBeenCalled()
    })

    it('returns this for chaining', () => {
      const emitter = makeEmitter()
      expect(emitter.removeAllListeners()).toBe(emitter)
    })
  })

  describe('getListenerCount', () => {
    it('returns 0 when no listeners', () => {
      expect(makeEmitter().getListenerCount('block')).toBe(0)
    })

    it('returns correct count after on()', () => {
      const emitter = makeEmitter()
      emitter.on('block', vi.fn())
      emitter.on('block', vi.fn())
      expect(emitter.getListenerCount('block')).toBe(2)
    })

    it('decreases after off()', () => {
      const emitter = makeEmitter()
      const l = vi.fn()
      emitter.on('block', l)
      emitter.on('block', vi.fn())
      emitter.off('block', l)
      expect(emitter.getListenerCount('block')).toBe(1)
    })

    it('returns 0 after once listener fires', () => {
      const emitter = makeEmitter()
      emitter.once('block', vi.fn())
      emitter.emit('block', { blockNumber: 1, hash: '' })
      expect(emitter.getListenerCount('block')).toBe(0)
    })
  })

  describe('eventNames', () => {
    it('returns empty array when no listeners', () => {
      expect(makeEmitter().eventNames()).toEqual([])
    })

    it('returns registered event names', () => {
      const emitter = makeEmitter()
      emitter.on('block', vi.fn())
      emitter.on('error', vi.fn())
      const names = emitter.eventNames()
      expect(names).toContain('block')
      expect(names).toContain('error')
      expect(names).toHaveLength(2)
    })

    it('does not include events with no remaining listeners', () => {
      const emitter = makeEmitter()
      const l = vi.fn()
      emitter.on('block', l)
      emitter.off('block', l)
      expect(emitter.eventNames()).not.toContain('block')
    })
  })

  describe('emit', () => {
    it('is a no-op when there are no listeners', () => {
      const emitter = makeEmitter()
      // Should not throw
      expect(() => emitter.emit('block', { blockNumber: 1, hash: '' })).not.toThrow()
    })

    it('forwards the exact payload to the listener', () => {
      const emitter = makeEmitter()
      const listener = vi.fn()
      emitter.on('data', listener)
      emitter.emit('data', 'hello world')
      expect(listener).toHaveBeenCalledWith('hello world')
    })

    it('handles undefined payload (connect event)', () => {
      const emitter = makeEmitter()
      const listener = vi.fn()
      emitter.on('connect', listener)
      emitter.emit('connect', undefined)
      expect(listener).toHaveBeenCalledWith(undefined)
    })

    it('propagates a throwing listener error (callers are responsible for guarding their handlers)', () => {
      // Design note: TypedEventEmitter does NOT wrap listener calls in try/catch.
      // This mirrors Node.js EventEmitter behaviour — errors propagate to the caller
      // of emit(). Callers must guard their own listener implementations.
      const emitter = makeEmitter()
      const throwing = vi.fn().mockImplementation(() => {
        throw new Error('listener boom')
      })
      const afterThrowing = vi.fn()

      emitter.on('block', throwing)
      emitter.on('block', afterThrowing)

      // The throw surfaces at emit() — callers must wrap in try/catch if needed
      expect(() => emitter.emit('block', { blockNumber: 1, hash: '' })).toThrow('listener boom')
      expect(throwing).toHaveBeenCalledOnce()
      // afterThrowing was not reached because iteration aborted on throw (documented behaviour)
      expect(afterThrowing).not.toHaveBeenCalled()
    })
  })

  describe('memory-leak warning', () => {
    it('warns when listener count exceeds threshold', () => {
      const emitter = makeEmitter()
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

      // Add 11 listeners — threshold is 10
      for (let i = 0; i <= 10; i++) {
        emitter.on('block', vi.fn())
      }

      expect(warn).toHaveBeenCalledOnce()
      expect(warn.mock.calls[0]?.[0]).toMatch(/memory leak/)

      warn.mockRestore()
    })
  })

  describe('re-entrant emit', () => {
    it('does not call a once listener twice when emit is re-entrant', () => {
      const emitter = makeEmitter()
      const calls: number[] = []

      emitter.once('block', (data) => {
        calls.push(data.blockNumber)
        // re-entrant emit of same event
        emitter.emit('block', { blockNumber: 99, hash: '' })
      })
      const persistent = vi.fn()
      emitter.on('block', persistent)

      emitter.emit('block', { blockNumber: 1, hash: '' })

      // once listener fires once (for blockNumber 1)
      expect(calls).toEqual([1])
      // persistent listener fires for both the outer and re-entrant emit
      expect(persistent).toHaveBeenCalledTimes(2)
    })
  })
})
