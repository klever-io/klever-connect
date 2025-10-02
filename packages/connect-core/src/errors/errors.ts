import type { ErrorContext } from './base'
import { BaseError } from './base'
import { ErrorCode } from './constants'

/**
 * Error thrown when network requests fail
 *
 * @example
 * ```typescript
 * try {
 *   await fetch(url)
 * } catch (error) {
 *   throw new NetworkError('Failed to connect to node', { url, statusCode: 500 })
 * }
 * ```
 */
export class NetworkError extends BaseError {
  constructor(message: string, context: ErrorContext = {}, cause?: Error) {
    super(message, ErrorCode.NetworkError, context, cause)
    this.name = 'NetworkError'
  }
}

/**
 * Error thrown when transaction operations fail
 *
 * @example
 * ```typescript
 * if (!tx.isValid()) {
 *   throw new TransactionError('Transaction validation failed', { txHash: tx.hash })
 * }
 * ```
 */
export class TransactionError extends BaseError {
  constructor(message: string, context: ErrorContext = {}, cause?: Error) {
    super(message, ErrorCode.TransactionError, context, cause)
    this.name = 'TransactionError'
  }
}

/**
 * Error thrown when wallet operations fail
 *
 * @example
 * ```typescript
 * if (!wallet.isConnected()) {
 *   throw new WalletError('Wallet not connected', { walletType: 'klever' })
 * }
 * ```
 */
export class WalletError extends BaseError {
  constructor(message: string, context: ErrorContext = {}, cause?: Error) {
    super(message, ErrorCode.WalletError, context, cause)
    this.name = 'WalletError'
  }
}

/**
 * Error thrown when input validation fails
 *
 * @example
 * ```typescript
 * if (!isValidAddress(address)) {
 *   throw new ValidationError(`Invalid address: ${address}`, { address, expected: 'klv1...' })
 * }
 * ```
 */
export class ValidationError extends BaseError {
  constructor(message: string, context: ErrorContext = {}, cause?: Error) {
    super(message, ErrorCode.InvalidInput, context, cause)
    this.name = 'ValidationError'
  }
}

/**
 * Error thrown when smart contract operations fail
 *
 * @example
 * ```typescript
 * const result = await contract.call('transfer', [to, amount])
 * if (!result.success) {
 *   throw new ContractError('Contract call failed', { contract: address, method: 'transfer' })
 * }
 * ```
 */
export class ContractError extends BaseError {
  constructor(message: string, context: ErrorContext = {}, cause?: Error) {
    super(message, ErrorCode.ContractError, context, cause)
    this.name = 'ContractError'
  }
}

/**
 * Error thrown when authentication fails
 *
 * @example
 * ```typescript
 * if (!isValidSignature(signature, message, publicKey)) {
 *   throw new AuthenticationError('Invalid signature', { publicKey })
 * }
 * ```
 */
export class AuthenticationError extends BaseError {
  constructor(message: string, context: ErrorContext = {}, cause?: Error) {
    super(message, ErrorCode.AuthenticationError, context, cause)
    this.name = 'AuthenticationError'
  }
}

/**
 * Retry-able error for operations that can be retried
 *
 * @example
 * ```typescript
 * throw new RetryableError('Service temporarily unavailable', ErrorCode.NetworkUnavailable,
 *   { service: 'node' }, { retryAfter: 5000, maxRetries: 3 })
 * ```
 */
export class RetryableError extends BaseError {
  public readonly retryAfter?: number // milliseconds
  public readonly maxRetries: number

  constructor(
    message: string,
    code: ErrorCode,
    context: ErrorContext = {},
    options: { retryAfter?: number; maxRetries?: number } = {},
  ) {
    super(message, code, context)
    this.name = 'RetryableError'
    if (options.retryAfter !== undefined) {
      this.retryAfter = options.retryAfter
    }
    this.maxRetries = options.maxRetries ?? 3
  }
}

/**
 * Error with recovery suggestions
 *
 * @example
 * ```typescript
 * throw new RecoverableError(
 *   'Insufficient balance',
 *   ErrorCode.InvalidAmount,
 *   ['Top up your account', 'Use a smaller amount'],
 *   { balance: '100', required: '1000' }
 * )
 * ```
 */
export class RecoverableError extends BaseError {
  public readonly suggestions: string[]

  constructor(message: string, code: ErrorCode, suggestions: string[], context: ErrorContext = {}) {
    super(message, code, context)
    this.name = 'RecoverableError'
    this.suggestions = suggestions
  }
}

/**
 * Aggregate error for multiple failures
 *
 * @example
 * ```typescript
 * const errors = await Promise.allSettled(operations)
 * const failures = errors.filter(r => r.status === 'rejected').map(r => r.reason)
 * if (failures.length > 0) {
 *   throw new AggregateError(failures, 'Multiple operations failed')
 * }
 * ```
 */
export class AggregateError extends BaseError {
  public readonly errors: Error[]

  constructor(errors: Error[], message = 'Multiple errors occurred') {
    const context = {
      errorCount: errors.length,
      errorTypes: errors.map((e) => e.constructor.name),
    }
    super(message, ErrorCode.Unknown, context)
    this.name = 'AggregateError'
    this.errors = errors
  }

  getAllMessages(): string[] {
    return this.errors.map((e) => e.message)
  }
}

/**
 * Error boundary for async operations
 *
 * @example
 * ```typescript
 * const result = await errorBoundary(
 *   async () => await riskyOperation(),
 *   {
 *     fallback: defaultValue,
 *     onError: (error) => console.error('Operation failed:', error),
 *     transform: (error) => new CustomError('Wrapped error', { cause: error })
 *   }
 * )
 * ```
 */
export async function errorBoundary<T>(
  operation: () => Promise<T>,
  options: {
    fallback?: T
    onError?: (error: Error) => void
    transform?: (error: Error) => Error
  } = {},
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    const err = error as Error

    if (options.onError) {
      options.onError(err)
    }

    if (options.transform) {
      throw options.transform(err)
    }

    if (options.fallback !== undefined) {
      return options.fallback
    }

    throw err
  }
}
