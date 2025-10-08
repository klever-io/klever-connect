/**
 * Interface Class for Klever Smart Contracts
 *
 * Provides a clean API for interacting with contract ABIs,
 * similar to ethers.js Interface.
 */

import type { ContractABI, ABIEndpoint, ABITypeDefinition } from './types/abi'
import { ABIParser } from './abi/parser'
import { ABIValidator } from './abi/validator'
import { FunctionEncoder } from './encoder/function-encoder'

/**
 * Interface class - wrapper around contract ABI
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
   */
  getEndpoint(name: string): ABIEndpoint {
    return ABIParser.getEndpoint(this.abi, name)
  }

  /**
   * Get type definition
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
   */
  encodeFunctionCall(functionName: string, args: Uint8Array[]): string {
    return this.encoder.encodeFunction(functionName, args)
  }

  /**
   * Encode constructor
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
