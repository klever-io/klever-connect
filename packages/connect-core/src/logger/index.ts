/**
 * Lightweight logging system with multiple levels and customizable output
 *
 * @example
 * ```typescript
 * import { createLogger } from '@klever/connect-core'
 *
 * const logger = createLogger('MyModule', {
 *   level: 'debug',
 *   prefix: true,
 *   timestamp: true
 * })
 *
 * logger.debug('Starting operation', { data: 123 })
 * logger.info('Operation complete')
 * logger.warn('Low balance detected')
 * logger.error('Failed to send transaction', error)
 * ```
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

export interface LoggerOptions {
  /** Minimum log level to output */
  level?: LogLevel
  /** Include timestamp in logs */
  timestamp?: boolean
  /** Include module prefix in logs */
  prefix?: boolean
  /** Custom log handler */
  handler?: LogHandler
  /** Enable color output (Node.js only) */
  colors?: boolean
}

export interface LogHandler {
  debug(module: string, message: string, ...args: unknown[]): void
  info(module: string, message: string, ...args: unknown[]): void
  warn(module: string, message: string, ...args: unknown[]): void
  error(module: string, message: string, ...args: unknown[]): void
}

export interface Logger {
  debug(message: string, ...args: unknown[]): void
  info(message: string, ...args: unknown[]): void
  warn(message: string, ...args: unknown[]): void
  error(message: string, ...args: unknown[]): void
  child(module: string): Logger
  setLevel(level: LogLevel): void
}

// Log level priorities
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
}

// ANSI color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
} as const

// Default console handler
class ConsoleHandler implements LogHandler {
  constructor(private options: LoggerOptions = {}) {}

  private format(level: LogLevel, module: string, message: string, ...args: unknown[]): unknown[] {
    const parts: string[] = []

    // Add timestamp
    if (this.options.timestamp) {
      const timestamp = new Date().toISOString()
      parts.push(this.options.colors ? `${COLORS.gray}${timestamp}${COLORS.reset}` : timestamp)
    }

    // Add level
    const levelStr = `[${level.toUpperCase()}]`
    if (this.options.colors) {
      const color =
        {
          debug: COLORS.gray,
          info: COLORS.cyan,
          warn: COLORS.yellow,
          error: COLORS.red,
          silent: COLORS.reset,
        }[level] || COLORS.reset

      parts.push(`${color}${levelStr}${COLORS.reset}`)
    } else {
      parts.push(levelStr)
    }

    // Add module prefix
    if (this.options.prefix && module) {
      const prefix = `[${module}]`
      parts.push(this.options.colors ? `${COLORS.bright}${prefix}${COLORS.reset}` : prefix)
    }

    // Add message
    parts.push(message)

    return [parts.join(' '), ...args]
  }

  debug(module: string, message: string, ...args: unknown[]): void {
    console.debug(...this.format('debug', module, message, ...args))
  }

  info(module: string, message: string, ...args: unknown[]): void {
    console.info(...this.format('info', module, message, ...args))
  }

  warn(module: string, message: string, ...args: unknown[]): void {
    console.warn(...this.format('warn', module, message, ...args))
  }

  error(module: string, message: string, ...args: unknown[]): void {
    console.error(...this.format('error', module, message, ...args))
  }
}

// Safe environment check for both browser and Node.js
function getEnvVar(name: string): string | undefined {
  // 1. Check process.env (Node.js)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name]
  }

  // 2. Check import.meta.env (Vite and other modern bundlers)
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const env =
        typeof import.meta === 'object' && 'env' in import.meta
          ? (import.meta as unknown as { env: Record<string, string | undefined> }).env
          : undefined
      const value = env?.[name] || env?.[`VITE_${name}`]
      if (value) return value
    }
  } catch {
    // import.meta is not available in this environment
  }

  // 3. Check globalThis (works in both browser and Node.js)
  if (typeof globalThis !== 'undefined' && (globalThis as Record<string, unknown>)[name]) {
    return (globalThis as Record<string, unknown>)[name] as string | undefined
  }

  // 4. Check window object (browser only)
  if (typeof window !== 'undefined') {
    // Check window.__env__ (common pattern for runtime config)
    const win = window as unknown as Record<string, unknown>
    const envObj = win['__env__'] as Record<string, unknown> | undefined
    if (envObj && typeof envObj === 'object' && name in envObj) {
      return envObj[name] as string | undefined
    }

    // Check window directly
    if (name in win) {
      return win[name] as string | undefined
    }
  }

  return undefined
}

function isProduction(): boolean {
  return getEnvVar('NODE_ENV') === 'production'
}

function isTTY(): boolean {
  if (typeof process !== 'undefined' && process.stdout?.isTTY) {
    return process.stdout.isTTY
  }
  return false
}

/**
 * Creates a logger instance for a specific module
 *
 * Logger instances provide debug, info, warn, and error logging methods
 * with configurable levels, formatting, and output handling.
 *
 * @param module - The module name to prefix log messages with
 * @param options - Optional logger configuration
 * @returns A configured Logger instance
 *
 * @example
 * ```typescript
 * const logger = createLogger('MyModule', {
 *   level: 'debug',
 *   timestamp: true,
 *   colors: true
 * })
 *
 * logger.debug('Detailed debug info')
 * logger.info('Operation started')
 * logger.warn('Low memory warning')
 * logger.error('Operation failed', error)
 *
 * // Create child logger with nested module name
 * const childLogger = logger.child('SubModule')
 * childLogger.info('Message from MyModule:SubModule')
 * ```
 */
export function createLogger(module: string, options: LoggerOptions = {}): Logger {
  const level = options.level || (isProduction() ? 'warn' : 'debug')
  const handler = options.handler || new ConsoleHandler(options)
  let currentLevel = LOG_LEVELS[level]

  const shouldLog = (logLevel: LogLevel): boolean => {
    return LOG_LEVELS[logLevel] >= currentLevel
  }

  return {
    debug(message: string, ...args: unknown[]): void {
      if (shouldLog('debug')) {
        handler.debug(module, message, ...args)
      }
    },

    info(message: string, ...args: unknown[]): void {
      if (shouldLog('info')) {
        handler.info(module, message, ...args)
      }
    },

    warn(message: string, ...args: unknown[]): void {
      if (shouldLog('warn')) {
        handler.warn(module, message, ...args)
      }
    },

    error(message: string, ...args: unknown[]): void {
      if (shouldLog('error')) {
        handler.error(module, message, ...args)
      }
    },

    child(childModule: string): Logger {
      return createLogger(`${module}:${childModule}`, options)
    },

    setLevel(newLevel: LogLevel): void {
      currentLevel = LOG_LEVELS[newLevel]
    },
  }
}

// Initialize global options - can be overridden by browser config
function initGlobalOptions(): LoggerOptions {
  const defaultLevel = isProduction() ? 'warn' : 'info'
  const envLevel = getEnvVar('KLEVER_LOG_LEVEL') as LogLevel

  return {
    level: envLevel || defaultLevel,
    timestamp: true,
    prefix: true,
    colors: !isProduction() && isTTY(),
  }
}

// Global logger configuration
let globalOptions: LoggerOptions = initGlobalOptions()

/**
 * Sets global logger options that apply to all loggers created via `getGlobalLogger()`
 *
 * This allows you to configure logging behavior across the entire SDK from a single point.
 * Changes affect all future logger instances created with `getGlobalLogger()`.
 *
 * @param options - Partial logger options to merge with current global settings
 *
 * @example
 * ```typescript
 * // Set global log level to debug
 * setGlobalLoggerOptions({ level: 'debug' })
 *
 * // Disable timestamps and colors
 * setGlobalLoggerOptions({
 *   timestamp: false,
 *   colors: false
 * })
 *
 * // Use custom log handler
 * setGlobalLoggerOptions({
 *   handler: myCustomHandler
 * })
 * ```
 *
 * @see {@link getGlobalLogger}
 * @see {@link initBrowserLogger}
 */
export function setGlobalLoggerOptions(options: Partial<LoggerOptions>): void {
  globalOptions = { ...globalOptions, ...options }
}

/**
 * Initialize logger configuration from browser environment
 * Call this in your app initialization to set up logging
 *
 * @example
 * ```typescript
 * // In your browser app initialization
 * initBrowserLogger({
 *   level: 'debug',
 *   timestamp: false,
 *   colors: false
 * })
 *
 * // Or load from window.__env__
 * window.__env__ = { KLEVER_LOG_LEVEL: 'debug' }
 * initBrowserLogger()
 * ```
 */
export function initBrowserLogger(options?: Partial<LoggerOptions>): void {
  // Re-initialize to pick up any browser environment variables
  const baseOptions = initGlobalOptions()

  // Merge with provided options
  if (options) {
    setGlobalLoggerOptions({ ...baseOptions, ...options })
  } else {
    setGlobalLoggerOptions(baseOptions)
  }
}

/**
 * Creates a logger instance using global configuration
 *
 * This is the recommended way to create loggers in the SDK, as it ensures
 * consistent configuration across all modules. The global options can be
 * set via `setGlobalLoggerOptions()` or `initBrowserLogger()`.
 *
 * @param module - The module name for the logger
 * @returns A Logger instance configured with global options
 *
 * @example
 * ```typescript
 * // In your module
 * const logger = getGlobalLogger('MyModule')
 *
 * logger.info('Module initialized')
 * logger.debug('Processing data', { count: 10 })
 * ```
 *
 * @see {@link setGlobalLoggerOptions} to configure global options
 * @see {@link createLogger} for creating loggers with custom options
 */
export function getGlobalLogger(module: string): Logger {
  return createLogger(module, globalOptions)
}

/**
 * Pre-configured logger for core SDK operations
 * @example
 * ```typescript
 * coreLogger.info('SDK initialized')
 * ```
 */
export const coreLogger = getGlobalLogger('core')

/**
 * Pre-configured logger for provider/network operations
 * @example
 * ```typescript
 * providerLogger.debug('Fetching account balance')
 * ```
 */
export const providerLogger = getGlobalLogger('provider')

/**
 * Pre-configured logger for wallet operations
 * @example
 * ```typescript
 * walletLogger.info('Signing transaction')
 * ```
 */
export const walletLogger = getGlobalLogger('wallet')

/**
 * Pre-configured logger for transaction operations
 * @example
 * ```typescript
 * transactionLogger.debug('Building transfer transaction')
 * ```
 */
export const transactionLogger = getGlobalLogger('transaction')

/**
 * Pre-configured logger for smart contract operations
 * @example
 * ```typescript
 * contractLogger.info('Invoking contract method', { method: 'transfer' })
 * ```
 */
export const contractLogger = getGlobalLogger('contract')
