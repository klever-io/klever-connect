import type { Environment } from './types'

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
  if (typeof window !== 'undefined' && window.document !== undefined) {
    return 'browser'
  }

  // Check for Node.js
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    return 'node'
  }

  // Unknown environment
  return 'unknown'
}

export function isBrowser(): boolean {
  return detectEnvironment() === 'browser'
}

export function isNode(): boolean {
  return detectEnvironment() === 'node'
}

export function isReactNative(): boolean {
  return detectEnvironment() === 'react-native'
}
