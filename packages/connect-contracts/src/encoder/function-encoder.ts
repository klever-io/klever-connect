/**
 * Function Call Encoder for Klever Smart Contracts
 *
 * Encodes function calls in the format: functionName@param1@param2@param3
 * where each parameter is hex-encoded according to its type.
 */

import type { ContractABI, ABIEndpoint } from '../types/abi'
import { ABIParser } from '../abi/parser'
import { bytesToHex } from './param-encoder'

/**
 * Encode a function call with parameters
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
 * Encode a single parameter to hex string (for manual usage)
 */
export function encodeParameter(value: Uint8Array): string {
  return bytesToHex(value)
}

/**
 * Helper to build function call data (used by Contract class)
 */
export class FunctionEncoder {
  constructor(private abi: ContractABI) {}

  /**
   * Encode function call
   */
  encodeFunction(functionName: string, args: Uint8Array[]): string {
    return encodeFunctionCall(this.abi, functionName, args)
  }

  /**
   * Encode constructor
   */
  encodeConstructor(args: Uint8Array[]): string {
    return encodeConstructor(this.abi, args)
  }

  /**
   * Get endpoint definition
   */
  getEndpoint(functionName: string): ABIEndpoint {
    return ABIParser.getEndpoint(this.abi, functionName)
  }
}
