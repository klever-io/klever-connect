import { describe, it, expect } from 'vitest'
import { detectEnvironment, isNode, isBrowser, isReactNative } from '../environment'

describe('detectEnvironment', () => {
  it('should detect node environment', () => {
    // Tests run in Node.js
    expect(detectEnvironment()).toBe('node')
  })
})

describe('isNode', () => {
  it('should return true in Node.js', () => {
    expect(isNode()).toBe(true)
  })
})

describe('isBrowser', () => {
  it('should return false in Node.js', () => {
    expect(isBrowser()).toBe(false)
  })
})

describe('isReactNative', () => {
  it('should return false in Node.js', () => {
    expect(isReactNative()).toBe(false)
  })
})
