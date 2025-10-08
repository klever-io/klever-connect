import type { BuildCallOptions } from '@klever/connect-transactions'
/**
 * Contract Interaction Types
 *
 * Types for contract function calls, queries, and results.
 */

/**
 * Options for contract function calls
 */
export type CallOptions = BuildCallOptions
/**
 * Decoded result from contract function
 */
export interface DecodedResult {
  /** Type of the decoded value */
  type: string
  /** Decoded value */
  value: unknown
  /** Number of bytes consumed during decoding */
  consumed?: number
}

/**
 * Type for contract function methods
 */
export interface ContractFunction {
  (...args: unknown[]): Promise<unknown>
}
