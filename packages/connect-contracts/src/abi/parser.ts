/**
 * ABI Parser for Klever Smart Contracts
 *
 * Utilities for parsing and querying contract ABIs.
 */

import type { ContractABI, ABIEndpoint, ABITypeDefinition } from '../types/abi'

export class ABIParser {
  /**
   * Parse ABI from JSON string or object
   */
  static parse(json: string | ContractABI): ContractABI {
    const abi = typeof json === 'string' ? JSON.parse(json) : json

    // Validate required fields
    if (!abi.name) {
      throw new Error('ABI missing contract name')
    }
    if (!abi.endpoints) {
      throw new Error('ABI missing endpoints')
    }
    if (!abi.types) {
      abi.types = {}
    }

    return abi
  }

  /**
   * Get endpoint definition by name
   */
  static getEndpoint(abi: ContractABI, name: string): ABIEndpoint {
    const endpoint = abi.endpoints.find((e) => e.name === name)
    if (!endpoint) {
      throw new Error(`Endpoint '${name}' not found in ABI`)
    }
    return endpoint
  }

  /**
   * Get type definition by name
   */
  static getType(abi: ContractABI, typeName: string): ABITypeDefinition {
    const type = abi.types[typeName]
    if (!type) {
      throw new Error(`Type '${typeName}' not found in ABI`)
    }
    return type
  }

  /**
   * Check if endpoint is readonly (query)
   */
  static isReadonly(endpoint: ABIEndpoint): boolean {
    return endpoint.mutability === 'readonly'
  }

  /**
   * Check if endpoint is payable
   */
  static isPayable(endpoint: ABIEndpoint): boolean {
    return !!endpoint.payableInTokens && endpoint.payableInTokens.length > 0
  }

  /**
   * Get all endpoint names
   */
  static getEndpointNames(abi: ContractABI): string[] {
    return abi.endpoints.map((e) => e.name).filter((name): name is string => !!name)
  }

  /**
   * Get all readonly endpoint names
   */
  static getReadonlyEndpoints(abi: ContractABI): string[] {
    return abi.endpoints
      .filter((e) => this.isReadonly(e))
      .map((e) => e.name)
      .filter((name): name is string => !!name)
  }

  /**
   * Get all mutable endpoint names
   */
  static getMutableEndpoints(abi: ContractABI): string[] {
    return abi.endpoints
      .filter((e) => !this.isReadonly(e))
      .map((e) => e.name)
      .filter((name): name is string => !!name)
  }
}
