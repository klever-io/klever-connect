import type { ErrorCode } from './constants'

/**
 * Additional context for errors
 */
export interface ErrorContext {
  [key: string]: unknown
}

/**
 * Serialized error format for transmission
 */
export interface SerializedError {
  name: string
  message: string
  code: ErrorCode
  context?: ErrorContext
  stack?: string
  cause?: SerializedError
}

/**
 * Base error class for all SDK errors with enhanced context and serialization
 *
 * @example
 * ```typescript
 * throw new BaseError('Something went wrong', ErrorCode.Unknown, { userId: '123' })
 * ```
 */
export class BaseError extends Error {
  public readonly code: ErrorCode
  public readonly context: ErrorContext
  public readonly timestamp: Date
  public readonly id: string

  constructor(message: string, code: ErrorCode, context: ErrorContext = {}, cause?: Error) {
    super(message)
    this.name = 'BaseError'
    this.code = code
    this.context = context
    this.timestamp = new Date()
    this.id = this.generateErrorId()
    this.cause = cause
    Error.captureStackTrace(this, this.constructor)
  }

  private generateErrorId(): string {
    return `${this.code}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  toJSON(): SerializedError {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      ...(Object.keys(this.context).length > 0 && { context: this.context }),
      ...(this.stack && { stack: this.stack }),
      ...(this.cause instanceof BaseError && { cause: this.cause.toJSON() }),
    }
  }

  static fromJSON(json: SerializedError): BaseError {
    const error = new BaseError(json.message, json.code, json.context)
    if (json.stack) {
      error.stack = json.stack
    }
    return error
  }
}
