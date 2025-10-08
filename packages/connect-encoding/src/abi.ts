export interface BuildInfo {
  rustc?: {
    version: string
    commitHash: string
    commitDate: string
    channel: string
    short: string
  }
  contractCrate?: {
    name: string
    version: string
    gitVersion?: string
  }
  framework?: {
    name: string
    version: string
  }
}

export interface ContractABI {
  buildInfo?: BuildInfo
  name: string
  constructor: ABIEndpoint
  upgradeConstructor?: ABIEndpoint
  endpoints: ABIEndpoint[]
  kdaAttributes?: unknown[]
  types: Record<string, ABITypeDefinition>
}

export interface ABIEndpoint {
  name: string
  mutability?: 'readonly' | 'mutable'
  inputs: ABIParameter[]
  outputs: ABIParameter[]
  payable?: boolean
  payableInTokens?: string[]
}

export interface ABIParameter {
  name?: string
  type: string
  multi?: boolean
  optional?: boolean
}

export interface FieldDefinition {
  name: string
  type: string
}

export interface VariantDefinition {
  name: string
  discriminant: number
}

export interface ABITypeDefinition {
  name?: string
  type?: 'struct' | 'enum'
  fields?: FieldDefinition[]
  variants?: VariantDefinition[]
}
