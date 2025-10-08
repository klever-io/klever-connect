/**
 * Utility functions for contract interactions
 */
import type { ContractABI } from './types/abi'
import { ABIParser } from './abi/parser'

/**
 * Load and validate an ABI from various sources
 *
 * This helper provides type-safe ABI loading from JSON imports or objects,
 * avoiding the need for type assertions like `as unknown as ContractABI`.
 *
 * @param abiSource - ABI as JSON object, string, or unknown type
 * @returns Validated ContractABI
 *
 * @example
 * ```typescript
 * // Load from JSON import
 * import myContractAbi from './my-contract.abi.json'
 * const abi = loadABI(myContractAbi)
 *
 * // Load from string
 * const abiString = fs.readFileSync('contract.abi.json', 'utf-8')
 * const abi = loadABI(abiString)
 *
 * // Load from object
 * const abiObj = { name: 'MyContract', endpoints: [...], types: {...} }
 * const abi = loadABI(abiObj)
 * ```
 */
export function loadABI(abiSource: unknown): ContractABI {
  // Parse and validate the ABI
  // ABIParser.parse handles string, object, and validates structure
  return ABIParser.parse(abiSource as ContractABI)
}

/**
 * Check if an object is a valid ContractABI
 *
 * @param obj - Object to check
 * @returns true if object has required ABI structure
 *
 * @example
 * ```typescript
 * if (isValidABI(someObject)) {
 *   const contract = new Contract(address, someObject)
 * }
 * ```
 */
export function isValidABI(obj: unknown): obj is ContractABI {
  if (!obj || typeof obj !== 'object') return false

  const abi = obj as Record<string, unknown>
  return (
    typeof abi['name'] === 'string' &&
    Array.isArray(abi['endpoints']) &&
    (abi.constructor === undefined || typeof abi.constructor === 'object')
  )
}
