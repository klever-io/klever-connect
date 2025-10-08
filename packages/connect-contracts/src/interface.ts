/**
 * Interface Class for Klever Smart Contracts
 *
 * Provides a clean API for interacting with contract ABIs, similar to ethers.js Interface.
 * The Interface class handles ABI parsing, validation, and provides utilities for encoding
 * function calls and decoding results.
 *
 * @remarks
 * The Interface class is used internally by the Contract class but can also be used
 * standalone for offline transaction building and ABI introspection.
 *
 * Key features:
 * - Parse and validate contract ABIs
 * - Encode function calls with parameters
 * - Query endpoint information (inputs, outputs, mutability)
 * - Access custom type definitions (structs, enums)
 *
 * @example Basic usage
 * ```typescript
 * import { Interface } from '@klever/connect-contracts'
 *
 * const abi = {
 *   name: 'MyContract',
 *   constructor: { inputs: [], outputs: [] },
 *   endpoints: [
 *     {
 *       name: 'transfer',
 *       inputs: [
 *         { name: 'to', type: 'Address' },
 *         { name: 'amount', type: 'BigUint' }
 *       ],
 *       outputs: [],
 *       mutability: 'mutable'
 *     }
 *   ],
 *   types: {}
 * }
 *
 * const iface = new Interface(abi)
 * console.log(iface.name) // 'MyContract'
 * console.log(iface.getEndpointNames()) // ['transfer']
 * ```
 *
 * @example Encoding function calls
 * ```typescript
 * // Get endpoint information
 * const endpoint = iface.getEndpoint('transfer')
 * console.log(endpoint.inputs) // [{ name: 'to', type: 'Address' }, ...]
 *
 * // Encode function call (offline)
 * const encodedArgs = [
 *   encodeAddress('klv1...'),
 *   encodeBigUint(1000000n)
 * ]
 * const callData = iface.encodeFunctionCall('transfer', encodedArgs)
 * console.log(callData) // 'transfer@...'
 * ```
 */

import type { ContractABI, ABIEndpoint, ABITypeDefinition } from './types/abi'
import { ABIParser } from './abi/parser'
import { ABIValidator } from './abi/validator'
import { FunctionEncoder } from './encoder/function-encoder'

/**
 * Interface class - wrapper around contract ABI
 *
 * Wraps a contract ABI and provides methods for introspection and encoding.
 * This class is thread-safe and can be reused across multiple Contract instances.
 *
 * @see {@link Contract} for contract interaction
 * @see {@link ABIParser} for ABI parsing utilities
 * @see {@link ABIValidator} for ABI validation
 */
export class Interface {
  readonly abi: ContractABI
  private encoder: FunctionEncoder

  constructor(abi: string | ContractABI) {
    // Parse and validate ABI
    this.abi = ABIParser.parse(abi)
    ABIValidator.validate(this.abi)

    // Create encoder
    this.encoder = new FunctionEncoder(this.abi)
  }

  /**
   * Get contract name
   */
  get name(): string {
    return this.abi.name
  }

  /**
   * Get all endpoint names
   */
  getEndpointNames(): string[] {
    return ABIParser.getEndpointNames(this.abi)
  }

  /**
   * Get readonly endpoint names
   */
  getReadonlyEndpoints(): string[] {
    return ABIParser.getReadonlyEndpoints(this.abi)
  }

  /**
   * Get mutable endpoint names
   */
  getMutableEndpoints(): string[] {
    return ABIParser.getMutableEndpoints(this.abi)
  }

  /**
   * Get endpoint definition
   *
   * Retrieves the full ABI definition for a specific endpoint, including
   * inputs, outputs, mutability, and other metadata.
   *
   * @param name - The name of the endpoint
   * @returns The endpoint definition
   * @throws Error if the endpoint is not found
   *
   * @example
   * ```typescript
   * const endpoint = iface.getEndpoint('transfer')
   * console.log(endpoint.inputs) // [{ name: 'to', type: 'Address' }, ...]
   * console.log(endpoint.mutability) // 'mutable'
   * ```
   */
  getEndpoint(name: string): ABIEndpoint {
    return ABIParser.getEndpoint(this.abi, name)
  }

  /**
   * Get type definition
   *
   * Retrieves a custom type definition (struct or enum) from the ABI.
   *
   * @param name - The name of the type
   * @returns The type definition
   * @throws Error if the type is not found
   *
   * @example
   * ```typescript
   * const betType = iface.getType('Bet')
   * if (betType.type === 'struct') {
   *   console.log(betType.fields) // [{ name: 'amount', type: 'BigUint' }, ...]
   * }
   * ```
   */
  getType(name: string): ABITypeDefinition {
    return ABIParser.getType(this.abi, name)
  }

  /**
   * Check if endpoint is readonly
   */
  isReadonly(name: string): boolean {
    const endpoint = this.getEndpoint(name)
    return ABIParser.isReadonly(endpoint)
  }

  /**
   * Check if endpoint is payable
   */
  isPayable(name: string): boolean {
    const endpoint = this.getEndpoint(name)
    return ABIParser.isPayable(endpoint)
  }

  /**
   * Encode function call
   *
   * Encodes a function call with parameters into the format expected by Klever smart contracts.
   * The result is a string in the format: `functionName@param1@param2@...` where each parameter
   * is hex-encoded.
   *
   * @param functionName - The name of the function to call
   * @param args - Array of encoded arguments (as Uint8Array)
   * @returns Encoded function call string
   *
   * @example
   * ```typescript
   * import { encodeAddress, encodeBigUint } from '@klever/connect-contracts'
   *
   * const iface = new Interface(abi)
   *
   * // Encode transfer function call
   * const encodedArgs = [
   *   encodeAddress('klv1...'),
   *   encodeBigUint(1000000n)
   * ]
   * const callData = iface.encodeFunctionCall('transfer', encodedArgs)
   * console.log(callData) // 'transfer@a1b2c3...@0f4240'
   * ```
   */
  encodeFunctionCall(functionName: string, args: Uint8Array[]): string {
    return this.encoder.encodeFunction(functionName, args)
  }

  /**
   * Encode constructor
   *
   * Encodes constructor arguments for contract deployment.
   * The result is a string in the format: `@param1@param2@...` (note the leading @).
   *
   * @param args - Array of encoded constructor arguments (as Uint8Array)
   * @returns Encoded constructor arguments string
   *
   * @example
   * ```typescript
   * const iface = new Interface(abi)
   *
   * // Encode constructor arguments
   * const encodedArgs = [
   *   encodeString('MyToken'),
   *   encodeString('MTK'),
   *   encodeBigUint(1000000000n)
   * ]
   * const constructorData = iface.encodeConstructor(encodedArgs)
   * console.log(constructorData) // '@4d79546f6b656e@4d544b@3b9aca00'
   * ```
   */
  encodeConstructor(args: Uint8Array[]): string {
    return this.encoder.encodeConstructor(args)
  }

  /**
   * Get constructor definition
   */
  getConstructor(): ABIEndpoint {
    return this.abi.constructor
  }

  /**
   * Get all custom types
   */
  getTypes(): Record<string, ABITypeDefinition> {
    return this.abi.types
  }

  /**
   * Check if type exists
   */
  hasType(name: string): boolean {
    return name in this.abi.types
  }

  /**
   * Format ABI as JSON string
   */
  format(): string {
    return JSON.stringify(this.abi, null, 2)
  }

  /**
   * Get endpoint count
   */
  get endpointCount(): number {
    return this.abi.endpoints.length
  }

  /**
   * Get type count
   */
  get typeCount(): number {
    return Object.keys(this.abi.types).length
  }
}
