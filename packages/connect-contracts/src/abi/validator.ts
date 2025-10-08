/**
 * ABI Validator for Klever Smart Contracts
 *
 * Validates ABI structure and integrity.
 */

import type { ContractABI } from '../types/abi'

export class ABIValidator {
  /**
   * Validate ABI structure
   */
  static validate(abi: ContractABI): void {
    // Validate contract name
    if (!abi.name || typeof abi.name !== 'string') {
      throw new Error('Invalid ABI: name must be a string')
    }

    // Validate constructor
    if (!abi.constructor) {
      throw new Error('Invalid ABI: constructor is required')
    }
    this.validateEndpoint(abi.constructor, 'constructor')

    // Validate endpoints array
    if (!Array.isArray(abi.endpoints)) {
      throw new Error('Invalid ABI: endpoints must be an array')
    }

    // Validate each endpoint
    abi.endpoints.forEach((endpoint) => {
      this.validateEndpoint(endpoint, endpoint.name || 'unnamed endpoint')
    })

    // Validate types
    if (typeof abi.types !== 'object' || abi.types === null) {
      throw new Error('Invalid ABI: types must be an object')
    }

    // Validate each type definition
    Object.entries(abi.types).forEach(([typeName, typeDef]) => {
      this.validateType(typeName, typeDef)
    })
  }

  /**
   * Validate endpoint definition
   */
  private static validateEndpoint(endpoint: unknown, name: string): void {
    if (!endpoint || typeof endpoint !== 'object') {
      throw new Error(`Invalid ABI: ${name} must be an object`)
    }

    const ep = endpoint as Record<string, unknown>

    // Validate inputs
    if (!Array.isArray(ep['inputs'])) {
      throw new Error(`Invalid ABI: ${name} inputs must be an array`)
    }

    // Validate outputs
    if (!Array.isArray(ep['outputs'])) {
      throw new Error(`Invalid ABI: ${name} outputs must be an array`)
    }

    // Validate mutability if present
    if (ep['mutability'] && ep['mutability'] !== 'readonly' && ep['mutability'] !== 'mutable') {
      throw new Error(`Invalid ABI: ${name} mutability must be 'readonly' or 'mutable'`)
    }

    // Validate payableInTokens if present
    if (ep['payableInTokens'] && !Array.isArray(ep['payableInTokens'])) {
      throw new Error(`Invalid ABI: ${name} payableInTokens must be an array`)
    }

    // Validate input parameters
    ;(ep['inputs'] as unknown[]).forEach((input, index) => {
      this.validateParameter(input, `${name} input[${index}]`)
    })

    // Validate output parameters
    ;(ep['outputs'] as unknown[]).forEach((output, index) => {
      this.validateParameter(output, `${name} output[${index}]`)
    })
  }

  /**
   * Validate parameter definition
   */
  private static validateParameter(param: unknown, location: string): void {
    if (!param || typeof param !== 'object') {
      throw new Error(`Invalid ABI: ${location} must be an object`)
    }

    const p = param as Record<string, unknown>

    if (!p['type'] || typeof p['type'] !== 'string') {
      throw new Error(`Invalid ABI: ${location} must have a string type`)
    }
  }

  /**
   * Validate type definition
   */
  private static validateType(typeName: string, typeDef: unknown): void {
    if (!typeDef || typeof typeDef !== 'object') {
      throw new Error(`Invalid ABI: type '${typeName}' must be an object`)
    }

    const td = typeDef as Record<string, unknown>

    if (td['type'] !== 'struct' && td['type'] !== 'enum') {
      throw new Error(`Invalid ABI: type '${typeName}' must be 'struct' or 'enum'`)
    }

    if (td['type'] === 'struct') {
      if (!Array.isArray(td['fields'])) {
        throw new Error(`Invalid ABI: struct '${typeName}' must have fields array`)
      }

      ;(td['fields'] as unknown[]).forEach((field, index) => {
        if (!field || typeof field !== 'object') {
          throw new Error(`Invalid ABI: struct '${typeName}' field[${index}] must be an object`)
        }

        const f = field as Record<string, unknown>
        if (!f['name'] || typeof f['name'] !== 'string') {
          throw new Error(`Invalid ABI: struct '${typeName}' field[${index}] must have a string name`)
        }
        if (!f['type'] || typeof f['type'] !== 'string') {
          throw new Error(`Invalid ABI: struct '${typeName}' field[${index}] must have a string type`)
        }
      })
    }

    if (td['type'] === 'enum') {
      if (!Array.isArray(td['variants'])) {
        throw new Error(`Invalid ABI: enum '${typeName}' must have variants array`)
      }

      ;(td['variants'] as unknown[]).forEach((variant, index) => {
        if (!variant || typeof variant !== 'object') {
          throw new Error(`Invalid ABI: enum '${typeName}' variant[${index}] must be an object`)
        }

        const v = variant as Record<string, unknown>
        if (!v['name'] || typeof v['name'] !== 'string') {
          throw new Error(`Invalid ABI: enum '${typeName}' variant[${index}] must have a string name`)
        }
        if (typeof v['discriminant'] !== 'number') {
          throw new Error(`Invalid ABI: enum '${typeName}' variant[${index}] must have a number discriminant`)
        }
      })
    }
  }
}
