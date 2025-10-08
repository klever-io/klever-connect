import type { Environment } from './types'

/**
 * Detects the current JavaScript runtime environment
 *
 * Performs comprehensive checks to identify whether the code is running in:
 * - React Native (mobile app)
 * - Browser (web app)
 * - Node.js (server/CLI)
 * - Unknown environment
 *
 * This is useful for conditional behavior based on platform capabilities.
 *
 * @returns The detected environment type
 *
 * @example
 * ```typescript
 * const env = detectEnvironment()
 * if (env === 'browser') {
 *   // Use browser-specific APIs
 * } else if (env === 'node') {
 *   // Use Node.js-specific APIs
 * }
 * ```
 *
 * @see {@link isBrowser}, {@link isNode}, {@link isReactNative} for specific checks
 */
export function detectEnvironment(): Environment {
  // Check for React Native
  // Using multiple checks for better reliability
  if (
    // Modern React Native detection
    (typeof global !== 'undefined' && '__DEV__' in (global as Record<string, unknown>)) ||
    // Fallback to navigator userAgent
    (typeof navigator !== 'undefined' &&
      navigator.userAgent &&
      navigator.userAgent.includes('ReactNative')) ||
    // Legacy check for older RN versions
    (typeof global !== 'undefined' &&
      (global as Record<string, unknown>)['navigator'] &&
      'product' in ((global as Record<string, unknown>)['navigator'] as Record<string, unknown>) &&
      ((global as Record<string, unknown>)['navigator'] as Record<string, unknown>)['product'] ===
        'ReactNative')
  ) {
    return 'react-native'
  }

  // Check for browser
  if (typeof globalThis !== 'undefined' && 'window' in globalThis && 'document' in globalThis) {
    return 'browser'
  }

  // Check for Node.js
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    return 'node'
  }

  // Unknown environment
  return 'unknown'
}

/**
 * Checks if the code is running in a browser environment
 *
 * @returns `true` if running in a browser, `false` otherwise
 *
 * @example
 * ```typescript
 * if (isBrowser()) {
 *   // Use localStorage, fetch, etc.
 *   window.localStorage.setItem('key', 'value')
 * }
 * ```
 *
 * @see {@link detectEnvironment} for full environment detection
 */
export function isBrowser(): boolean {
  return detectEnvironment() === 'browser'
}

/**
 * Checks if the code is running in Node.js environment
 *
 * @returns `true` if running in Node.js, `false` otherwise
 *
 * @example
 * ```typescript
 * if (isNode()) {
 *   // Use Node.js-specific modules
 *   const fs = require('fs')
 * }
 * ```
 *
 * @see {@link detectEnvironment} for full environment detection
 */
export function isNode(): boolean {
  return detectEnvironment() === 'node'
}

/**
 * Checks if the code is running in React Native environment
 *
 * @returns `true` if running in React Native, `false` otherwise
 *
 * @example
 * ```typescript
 * if (isReactNative()) {
 *   // Use React Native-specific modules
 *   import { AsyncStorage } from 'react-native'
 * }
 * ```
 *
 * @see {@link detectEnvironment} for full environment detection
 */
export function isReactNative(): boolean {
  return detectEnvironment() === 'react-native'
}
