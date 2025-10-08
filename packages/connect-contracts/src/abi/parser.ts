/**
 * ABI Parser for Klever Smart Contracts
 *
 * Utilities for parsing and querying contract ABIs (Application Binary Interface).
 * The ABI defines the interface of a smart contract, including its endpoints (functions),
 * input/output parameters, and custom type definitions (structs, enums).
 *
 * @remarks
 * This class provides static methods for:
 * - Parsing ABI from JSON strings or objects
 * - Querying endpoint definitions by name
 * - Extracting type definitions (structs, enums)
 * - Filtering endpoints by mutability (readonly vs mutable)
 * - Checking endpoint properties (payable, readonly)
 *
 * @example Basic ABI parsing
 * ```typescript
 * import { ABIParser } from '@klever/connect-contracts'
 *
 * const abiJson = '{"name": "MyContract", "endpoints": [...], "types": {...}}'
 * const abi = ABIParser.parse(abiJson)
 *
 * // Get all endpoint names
 * const endpoints = ABIParser.getEndpointNames(abi)
 * console.log(endpoints) // ['transfer', 'balanceOf', ...]
 *
 * // Get specific endpoint
 * const transferEndpoint = ABIParser.getEndpoint(abi, 'transfer')
 * console.log(transferEndpoint.inputs) // [{ name: 'to', type: 'Address' }, ...]
 * ```
 *
 * @example Filtering endpoints by mutability
 * ```typescript
 * // Get readonly endpoints (queries)
 * const queries = ABIParser.getReadonlyEndpoints(abi)
 *
 * // Get mutable endpoints (transactions)
 * const mutations = ABIParser.getMutableEndpoints(abi)
 * ```
 */

import type { ContractABI, ABIEndpoint, ABITypeDefinition } from '../types/abi'

/**
 * ABI Parser class for Klever smart contracts
 *
 * Provides static utility methods for parsing and querying contract ABIs.
 * All methods are static and do not require instantiation.
 *
 * @see {@link ContractABI} for ABI structure
 * @see {@link Interface} for higher-level ABI wrapper
 */
export class ABIParser {
  /**
   * Parse ABI from JSON string or object
   *
   * Parses and validates the basic structure of a contract ABI. The ABI can be
   * provided as a JSON string or as an already-parsed object.
   *
   * @param json - ABI as JSON string or ContractABI object
   * @returns Parsed and validated ContractABI object
   * @throws Error if ABI is missing required fields (name, endpoints)
   *
   * @example Parse from JSON string
   * ```typescript
   * const abiJson = `{
   *   "name": "MyContract",
   *   "constructor": { "inputs": [], "outputs": [] },
   *   "endpoints": [
   *     {
   *       "name": "transfer",
   *       "inputs": [
   *         { "name": "to", "type": "Address" },
   *         { "name": "amount", "type": "BigUint" }
   *       ],
   *       "outputs": [],
   *       "mutability": "mutable"
   *     }
   *   ],
   *   "types": {}
   * }`
   *
   * const abi = ABIParser.parse(abiJson)
   * ```
   *
   * @example Parse from object
   * ```typescript
   * const abiObject = {
   *   name: 'MyContract',
   *   constructor: { inputs: [], outputs: [] },
   *   endpoints: [...],
   *   types: {}
   * }
   *
   * const abi = ABIParser.parse(abiObject)
   * ```
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
   *
   * Retrieves the full ABI definition for a specific endpoint (function).
   * The endpoint definition includes input parameters, output parameters,
   * mutability, and other metadata.
   *
   * @param abi - The contract ABI
   * @param name - The name of the endpoint to retrieve
   * @returns The endpoint definition
   * @throws Error if the endpoint is not found
   *
   * @example
   * ```typescript
   * const abi = ABIParser.parse(abiJson)
   * const transferEndpoint = ABIParser.getEndpoint(abi, 'transfer')
   *
   * console.log(transferEndpoint.name) // 'transfer'
   * console.log(transferEndpoint.inputs) // [{ name: 'to', type: 'Address' }, ...]
   * console.log(transferEndpoint.mutability) // 'mutable'
   * ```
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
   *
   * Retrieves a custom type definition (struct or enum) from the ABI.
   * Custom types are used for complex parameters and return values.
   *
   * @param abi - The contract ABI
   * @param typeName - The name of the type to retrieve
   * @returns The type definition (struct or enum)
   * @throws Error if the type is not found
   *
   * @example Get struct definition
   * ```typescript
   * const betType = ABIParser.getType(abi, 'Bet')
   *
   * if (betType.type === 'struct') {
   *   console.log(betType.fields)
   *   // [
   *   //   { name: 'betType', type: 'u8' },
   *   //   { name: 'betValue', type: 'u32' },
   *   //   { name: 'amount', type: 'BigUint' }
   *   // ]
   * }
   * ```
   *
   * @example Get enum definition
   * ```typescript
   * const statusType = ABIParser.getType(abi, 'Status')
   *
   * if (statusType.type === 'enum') {
   *   console.log(statusType.variants)
   *   // [
   *   //   { name: 'Pending', discriminant: 0 },
   *   //   { name: 'Active', discriminant: 1 },
   *   //   { name: 'Completed', discriminant: 2 }
   *   // ]
   * }
   * ```
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
   *
   * Determines whether an endpoint is readonly (query) or mutable (transaction).
   * Readonly endpoints do not modify contract state and don't require transactions.
   * Mutable endpoints modify state and require signed transactions.
   *
   * @param endpoint - The endpoint definition
   * @returns True if the endpoint is readonly, false otherwise
   *
   * @example
   * ```typescript
   * const balanceEndpoint = ABIParser.getEndpoint(abi, 'balanceOf')
   * const isQuery = ABIParser.isReadonly(balanceEndpoint)
   * console.log(isQuery) // true
   *
   * const transferEndpoint = ABIParser.getEndpoint(abi, 'transfer')
   * const isTransaction = !ABIParser.isReadonly(transferEndpoint)
   * console.log(isTransaction) // true
   * ```
   */
  static isReadonly(endpoint: ABIEndpoint): boolean {
    return endpoint.mutability === 'readonly'
  }

  /**
   * Check if endpoint is payable
   *
   * Determines whether an endpoint accepts payment (KLV or KDA tokens).
   * Payable endpoints can receive value along with the function call.
   *
   * @param endpoint - The endpoint definition
   * @returns True if the endpoint is payable, false otherwise
   *
   * @example
   * ```typescript
   * const depositEndpoint = ABIParser.getEndpoint(abi, 'deposit')
   * const canReceivePayment = ABIParser.isPayable(depositEndpoint)
   *
   * if (canReceivePayment) {
   *   console.log('This function accepts payment')
   *   console.log('Accepted tokens:', depositEndpoint.payableInTokens)
   * }
   * ```
   */
  static isPayable(endpoint: ABIEndpoint): boolean {
    return !!endpoint.payableInTokens && endpoint.payableInTokens.length > 0
  }

  /**
   * Get all endpoint names
   *
   * Returns an array of all endpoint (function) names defined in the contract ABI.
   * This includes both readonly (query) and mutable (transaction) endpoints.
   *
   * @param abi - The contract ABI
   * @returns Array of endpoint names
   *
   * @example
   * ```typescript
   * const abi = ABIParser.parse(abiJson)
   * const endpoints = ABIParser.getEndpointNames(abi)
   *
   * console.log(endpoints)
   * // ['transfer', 'balanceOf', 'approve', 'allowance', 'totalSupply']
   *
   * // Check if a function exists
   * if (endpoints.includes('transfer')) {
   *   console.log('Contract has transfer function')
   * }
   * ```
   */
  static getEndpointNames(abi: ContractABI): string[] {
    return abi.endpoints.map((e) => e.name).filter((name): name is string => !!name)
  }

  /**
   * Get all readonly endpoint names
   *
   * Returns an array of all readonly endpoint names (query functions).
   * Readonly endpoints don't modify contract state and can be called without
   * creating transactions or paying fees.
   *
   * @param abi - The contract ABI
   * @returns Array of readonly endpoint names
   *
   * @example
   * ```typescript
   * const abi = ABIParser.parse(abiJson)
   * const queries = ABIParser.getReadonlyEndpoints(abi)
   *
   * console.log('Query functions:', queries)
   * // ['balanceOf', 'allowance', 'totalSupply', 'owner']
   *
   * // Call all query functions without transactions
   * for (const queryName of queries) {
   *   const result = await contract[queryName]()
   *   console.log(`${queryName}:`, result)
   * }
   * ```
   */
  static getReadonlyEndpoints(abi: ContractABI): string[] {
    return abi.endpoints
      .filter((e) => this.isReadonly(e))
      .map((e) => e.name)
      .filter((name): name is string => !!name)
  }

  /**
   * Get all mutable endpoint names
   *
   * Returns an array of all mutable endpoint names (transaction functions).
   * Mutable endpoints modify contract state and require signed transactions
   * with fees.
   *
   * @param abi - The contract ABI
   * @returns Array of mutable endpoint names
   *
   * @example
   * ```typescript
   * const abi = ABIParser.parse(abiJson)
   * const mutations = ABIParser.getMutableEndpoints(abi)
   *
   * console.log('Transaction functions:', mutations)
   * // ['transfer', 'approve', 'transferFrom', 'mint', 'burn']
   *
   * // These functions require a signer
   * for (const mutationName of mutations) {
   *   console.log(`${mutationName} requires transaction`)
   * }
   * ```
   */
  static getMutableEndpoints(abi: ContractABI): string[] {
    return abi.endpoints
      .filter((e) => !this.isReadonly(e))
      .map((e) => e.name)
      .filter((name): name is string => !!name)
  }
}
