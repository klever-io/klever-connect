/**
 * Function Call Encoder for Klever Smart Contracts
 *
 * Encodes function calls in the format: functionName@param1@param2@param3
 * where each parameter is hex-encoded according to its type.
 *
 * @remarks
 * The FunctionEncoder class is used internally by the Interface class to encode
 * function calls for smart contract interactions. The encoding format is specific
 * to Klever blockchain and consists of:
 * - Function name
 * - @ separator
 * - Hex-encoded parameters separated by @
 *
 * @example Using FunctionEncoder
 * ```typescript
 * import { FunctionEncoder } from '@klever/connect-contracts'
 *
 * const encoder = new FunctionEncoder(abi)
 *
 * // Encode function call
 * const args = [
 *   encodeAddress('klv1...'),
 *   encodeBigUint(1000000n)
 * ]
 * const callData = encoder.encodeFunction('transfer', args)
 * console.log(callData) // 'transfer@a1b2c3...@0f4240'
 * ```
 *
 * @example Encoding constructor
 * ```typescript
 * const encoder = new FunctionEncoder(abi)
 *
 * const args = [
 *   encodeString('MyToken'),
 *   encodeString('MTK')
 * ]
 * const constructorData = encoder.encodeConstructor(args)
 * console.log(constructorData) // '@4d79546f6b656e@4d544b'
 * ```
 */

import type { ContractABI, ABIEndpoint } from '../types/abi'
import { ABIParser } from '../abi/parser'
import { bytesToHex } from './param-encoder'

/**
 * Encode a function call with parameters
 *
 * Encodes a function call in Klever's format: `functionName@param1@param2@param3`
 * where each parameter is a hex-encoded Uint8Array.
 *
 * @param abi - The contract ABI
 * @param functionName - The name of the function to call
 * @param args - Array of encoded arguments (as Uint8Array)
 * @returns Encoded function call string
 * @throws Error if the function doesn't exist or argument count doesn't match
 *
 * @example
 * ```typescript
 * const abi = {...} // Contract ABI
 * const args = [
 *   encodeAddress('klv1...'),
 *   encodeU64(1000000n)
 * ]
 *
 * const callData = encodeFunctionCall(abi, 'transfer', args)
 * console.log(callData)
 * // 'transfer@a1b2c3d4e5f6...@0f4240'
 * ```
 */
export function encodeFunctionCall(
  abi: ContractABI,
  functionName: string,
  args: Uint8Array[],
): string {
  // Validate endpoint exists
  const endpoint = ABIParser.getEndpoint(abi, functionName)

  // Validate argument count
  if (args.length !== endpoint.inputs.length) {
    throw new Error(
      `Invalid argument count for ${functionName}: expected ${endpoint.inputs.length}, got ${args.length}`,
    )
  }

  // Build function call string: functionName@param1@param2@...
  const parts = [functionName]

  for (const arg of args) {
    const hexArg = bytesToHex(arg)
    parts.push(hexArg)
  }

  return parts.join('@')
}

/**
 * Encode constructor call (for deployment)
 *
 * Encodes constructor arguments for contract deployment in the format:
 * `@param1@param2@param3` (note the leading @ separator).
 * Returns empty string if no constructor arguments.
 *
 * @param abi - The contract ABI
 * @param args - Array of encoded constructor arguments (as Uint8Array)
 * @returns Encoded constructor arguments string (empty if no args)
 * @throws Error if argument count doesn't match constructor definition
 *
 * @example No arguments
 * ```typescript
 * const abi = {
 *   constructor: { inputs: [], outputs: [] },
 *   // ...
 * }
 *
 * const constructorData = encodeConstructor(abi, [])
 * console.log(constructorData) // ''
 * ```
 *
 * @example With arguments
 * ```typescript
 * const args = [
 *   encodeString('MyToken'),
 *   encodeString('MTK'),
 *   encodeU64(1000000n)
 * ]
 *
 * const constructorData = encodeConstructor(abi, args)
 * console.log(constructorData)
 * // '@4d79546f6b656e@4d544b@0f4240'
 * ```
 */
export function encodeConstructor(abi: ContractABI, args: Uint8Array[]): string {
  const constructor = abi.constructor

  // Validate argument count
  if (args.length !== constructor.inputs.length) {
    throw new Error(
      `Invalid constructor argument count: expected ${constructor.inputs.length}, got ${args.length}`,
    )
  }

  // If no arguments, return empty string
  if (args.length === 0) {
    return ''
  }

  // Build constructor args: @param1@param2@...
  const parts = args.map((arg) => bytesToHex(arg))
  return '@' + parts.join('@')
}

/**
 * Encode a single parameter to hex string
 *
 * Converts a Uint8Array parameter to a hex string for use in function calls.
 * This is a low-level utility function for manual encoding.
 *
 * @param value - The parameter value as Uint8Array
 * @returns Hex-encoded parameter string (lowercase, no '0x' prefix)
 *
 * @example
 * ```typescript
 * const amount = encodeU64(1000000n)
 * const hex = encodeParameter(amount)
 * console.log(hex) // '0f4240'
 *
 * // Can be used to manually build function calls
 * const callData = `transfer@${addressHex}@${hex}`
 * ```
 */
export function encodeParameter(value: Uint8Array): string {
  return bytesToHex(value)
}

/**
 * Function Encoder class for smart contract function calls
 *
 * Provides methods to encode function calls and constructor arguments
 * according to Klever's encoding format. Used internally by the Contract
 * and Interface classes.
 *
 * @example
 * ```typescript
 * const encoder = new FunctionEncoder(abi)
 *
 * // Encode function call
 * const args = [encodeAddress('klv1...'), encodeU64(1000n)]
 * const callData = encoder.encodeFunction('transfer', args)
 * console.log(callData) // 'transfer@a1b2...@03e8'
 *
 * // Encode constructor
 * const constructorArgs = [encodeString('MyToken')]
 * const constructorData = encoder.encodeConstructor(constructorArgs)
 * console.log(constructorData) // '@4d79546f6b656e'
 * ```
 */
export class FunctionEncoder {
  constructor(private abi: ContractABI) {}

  /**
   * Encode function call
   *
   * Encodes a function call with the given arguments.
   *
   * @param functionName - The name of the function to encode
   * @param args - Array of encoded arguments (as Uint8Array)
   * @returns Encoded function call string in format: functionName@param1@param2
   * @throws Error if function doesn't exist or argument count doesn't match
   *
   * @example
   * ```typescript
   * const encoder = new FunctionEncoder(abi)
   * const callData = encoder.encodeFunction('transfer', [
   *   encodeAddress('klv1receiver...'),
   *   encodeU64(1000000n)
   * ])
   * console.log(callData) // 'transfer@a1b2...@0f4240'
   * ```
   */
  encodeFunction(functionName: string, args: Uint8Array[]): string {
    return encodeFunctionCall(this.abi, functionName, args)
  }

  /**
   * Encode constructor
   *
   * Encodes constructor arguments for contract deployment.
   *
   * @param args - Array of encoded constructor arguments (as Uint8Array)
   * @returns Encoded constructor string in format: @param1@param2 (empty if no args)
   * @throws Error if argument count doesn't match constructor definition
   *
   * @example
   * ```typescript
   * const encoder = new FunctionEncoder(tokenABI)
   * const constructorData = encoder.encodeConstructor([
   *   encodeString('MyToken'),
   *   encodeString('MTK'),
   *   encodeU64(1000000000n)
   * ])
   * console.log(constructorData) // '@4d79546f6b656e@4d544b@3b9aca00'
   * ```
   */
  encodeConstructor(args: Uint8Array[]): string {
    return encodeConstructor(this.abi, args)
  }

  /**
   * Get endpoint definition
   *
   * Retrieves the ABI endpoint definition for a specific function.
   * This is a convenience method that delegates to ABIParser.
   *
   * @param functionName - The name of the function
   * @returns The endpoint definition
   * @throws Error if the function doesn't exist in the ABI
   *
   * @example
   * ```typescript
   * const encoder = new FunctionEncoder(abi)
   * const endpoint = encoder.getEndpoint('transfer')
   *
   * console.log(endpoint.name) // 'transfer'
   * console.log(endpoint.inputs) // [{ name: 'to', type: 'Address' }, ...]
   * console.log(endpoint.mutability) // 'mutable'
   * ```
   */
  getEndpoint(functionName: string): ABIEndpoint {
    return ABIParser.getEndpoint(this.abi, functionName)
  }
}
