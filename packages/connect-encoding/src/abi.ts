export interface ABI {
  name?: string
  endpoints?: ABIEndpoint[]
  types?: Record<string, ABITypeDefinition>
}

export interface ABIEndpoint {
  name: string
  mutability?: 'readonly' | 'mutable'
  inputs?: ABIParameter[]
  outputs?: ABIParameter[]
  payable?: boolean
  payableInTokens?: string[]
}

export interface ABIParameter {
  name?: string
  type: string
  multi?: boolean
  optional?: boolean
}

export interface ABITypeDefinition {
  name?: string
  type?: 'struct' | 'enum'
  fields?: Array<{ name: string; type: string }>
  variants?: Array<{ name: string; discriminant: number }>
}
