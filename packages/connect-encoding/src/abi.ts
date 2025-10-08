/**
 * Build information for a smart contract
 *
 * Contains metadata about how the contract was compiled, including Rust compiler
 * version, contract crate details, and framework information. This is useful for
 * debugging, verification, and ensuring contract compatibility.
 *
 * @example
 * ```typescript
 * const buildInfo: BuildInfo = {
 *   rustc: {
 *     version: "1.70.0",
 *     commitHash: "90c541806f23a127002de5b4038be731ba1458ca",
 *     commitDate: "2023-05-31",
 *     channel: "stable",
 *     short: "rustc 1.70.0 (90c541806 2023-05-31)"
 *   },
 *   contractCrate: {
 *     name: "my-contract",
 *     version: "0.1.0",
 *     gitVersion: "v0.1.0-5-g1a2b3c4"
 *   },
 *   framework: {
 *     name: "klever-sc",
 *     version: "0.45.0"
 *   }
 * }
 * ```
 */
export interface BuildInfo {
  /** Rust compiler information used to build the contract */
  rustc?: {
    /** Full Rust compiler version */
    version: string
    /** Git commit hash of the Rust compiler */
    commitHash: string
    /** Date the Rust compiler was built */
    commitDate: string
    /** Release channel (stable, beta, nightly) */
    channel: string
    /** Short version string */
    short: string
  }
  /** Contract crate metadata */
  contractCrate?: {
    /** Name of the contract crate */
    name: string
    /** Semantic version of the contract */
    version: string
    /** Git version tag if available */
    gitVersion?: string
  }
  /** Framework information */
  framework?: {
    /** Name of the smart contract framework */
    name: string
    /** Version of the framework */
    version: string
  }
}

/**
 * Application Binary Interface (ABI) definition for a smart contract
 *
 * The ABI describes the contract's interface, including all callable methods,
 * their parameters, return types, and custom type definitions. This is essential
 * for encoding function calls and decoding responses when interacting with
 * deployed contracts.
 *
 * @example
 * ```typescript
 * const contractABI: ContractABI = {
 *   name: "TokenContract",
 *   constructor: {
 *     name: "init",
 *     inputs: [
 *       { name: "initial_supply", type: "BigUint" }
 *     ],
 *     outputs: []
 *   },
 *   endpoints: [
 *     {
 *       name: "transfer",
 *       mutability: "mutable",
 *       inputs: [
 *         { name: "to", type: "Address" },
 *         { name: "amount", type: "BigUint" }
 *       ],
 *       outputs: [],
 *       payable: false
 *     },
 *     {
 *       name: "getBalance",
 *       mutability: "readonly",
 *       inputs: [{ name: "address", type: "Address" }],
 *       outputs: [{ type: "BigUint" }]
 *     }
 *   ],
 *   types: {}
 * }
 * ```
 */
export interface ContractABI {
  /** Optional build information about the contract */
  buildInfo?: BuildInfo
  /** Name of the contract */
  name: string
  /** Constructor endpoint for contract initialization */
  constructor: ABIEndpoint
  /** Optional upgrade constructor for contract upgrades */
  upgradeConstructor?: ABIEndpoint
  /** Array of all callable endpoints/functions in the contract */
  endpoints: ABIEndpoint[]
  /** KDA (Klever Digital Asset) specific attributes */
  kdaAttributes?: unknown[]
  /** Custom type definitions used in the contract */
  types: Record<string, ABITypeDefinition>
}

/**
 * Definition of a contract endpoint (function/method)
 *
 * Describes a callable function in a smart contract, including its name,
 * mutability, parameters, return values, and payment capabilities.
 *
 * @example
 * ```typescript
 * // Read-only query endpoint
 * const getBalanceEndpoint: ABIEndpoint = {
 *   name: "getBalance",
 *   mutability: "readonly",
 *   inputs: [{ name: "address", type: "Address" }],
 *   outputs: [{ type: "BigUint" }],
 *   payable: false
 * }
 *
 * // Mutable transaction endpoint
 * const transferEndpoint: ABIEndpoint = {
 *   name: "transfer",
 *   mutability: "mutable",
 *   inputs: [
 *     { name: "to", type: "Address" },
 *     { name: "amount", type: "BigUint" }
 *   ],
 *   outputs: [],
 *   payable: false
 * }
 *
 * // Payable endpoint accepting KLV
 * const depositEndpoint: ABIEndpoint = {
 *   name: "deposit",
 *   mutability: "mutable",
 *   inputs: [],
 *   outputs: [],
 *   payable: true
 * }
 *
 * // Endpoint accepting specific tokens
 * const swapEndpoint: ABIEndpoint = {
 *   name: "swap",
 *   mutability: "mutable",
 *   inputs: [{ name: "min_out", type: "BigUint" }],
 *   outputs: [],
 *   payable: true,
 *   payableInTokens: ["USDT-ABC123", "USDC-DEF456"]
 * }
 * ```
 */
export interface ABIEndpoint {
  /** Name of the endpoint/function */
  name: string
  /** Whether the function modifies state (mutable) or only reads (readonly) */
  mutability?: 'readonly' | 'mutable'
  /** Array of input parameters for the function */
  inputs: ABIParameter[]
  /** Array of output/return values from the function */
  outputs: ABIParameter[]
  /** Whether the function can receive payments (KLV or tokens) */
  payable?: boolean
  /** Specific token IDs that can be sent to this payable function */
  payableInTokens?: string[]
}

/**
 * Definition of a function parameter or return value
 *
 * Describes a single parameter for an endpoint input or output, including its
 * name, type, and whether it can accept multiple values or is optional.
 *
 * @example
 * ```typescript
 * // Simple required parameter
 * const addressParam: ABIParameter = {
 *   name: "recipient",
 *   type: "Address"
 * }
 *
 * // BigUint amount parameter
 * const amountParam: ABIParameter = {
 *   name: "amount",
 *   type: "BigUint"
 * }
 *
 * // Optional parameter
 * const optionalParam: ABIParameter = {
 *   name: "memo",
 *   type: "bytes",
 *   optional: true
 * }
 *
 * // Multi-value parameter (variadic)
 * const multiParam: ABIParameter = {
 *   name: "recipients",
 *   type: "Address",
 *   multi: true
 * }
 *
 * // Anonymous return value (no name)
 * const returnValue: ABIParameter = {
 *   type: "BigUint"
 * }
 * ```
 */
export interface ABIParameter {
  /** Optional name of the parameter (outputs may not have names) */
  name?: string
  /** Type of the parameter (e.g., "Address", "BigUint", "u64", custom types) */
  type: string
  /** Whether this parameter accepts multiple values (variadic) */
  multi?: boolean
  /** Whether this parameter is optional */
  optional?: boolean
}

/**
 * Definition of a field in a struct type
 *
 * Represents a single field within a custom struct type, similar to a field
 * in a Rust struct or a property in a TypeScript interface.
 *
 * @example
 * ```typescript
 * // Fields for a User struct
 * const nameField: FieldDefinition = {
 *   name: "name",
 *   type: "bytes"
 * }
 *
 * const balanceField: FieldDefinition = {
 *   name: "balance",
 *   type: "BigUint"
 * }
 *
 * const addressField: FieldDefinition = {
 *   name: "address",
 *   type: "Address"
 * }
 * ```
 */
export interface FieldDefinition {
  /** Name of the field */
  name: string
  /** Type of the field (primitive or custom type) */
  type: string
}

/**
 * Definition of a variant in an enum type
 *
 * Represents a single variant within a custom enum type, similar to a variant
 * in a Rust enum. The discriminant is used to identify the variant when encoding.
 *
 * @example
 * ```typescript
 * // Variants for a Status enum
 * const pendingVariant: VariantDefinition = {
 *   name: "Pending",
 *   discriminant: 0
 * }
 *
 * const activeVariant: VariantDefinition = {
 *   name: "Active",
 *   discriminant: 1
 * }
 *
 * const completedVariant: VariantDefinition = {
 *   name: "Completed",
 *   discriminant: 2
 * }
 *
 * const cancelledVariant: VariantDefinition = {
 *   name: "Cancelled",
 *   discriminant: 3
 * }
 * ```
 */
export interface VariantDefinition {
  /** Name of the enum variant */
  name: string
  /** Numeric discriminant value for this variant (used in encoding) */
  discriminant: number
}

/**
 * Definition of a custom type used in the contract ABI
 *
 * Represents complex types like structs or enums that are used in the contract.
 * Structs contain fields, while enums contain variants. This allows the ABI to
 * describe complex data structures used as parameters or return values.
 *
 * @example
 * ```typescript
 * // Struct type definition
 * const userType: ABITypeDefinition = {
 *   name: "User",
 *   type: "struct",
 *   fields: [
 *     { name: "address", type: "Address" },
 *     { name: "name", type: "bytes" },
 *     { name: "balance", type: "BigUint" },
 *     { name: "is_active", type: "bool" }
 *   ]
 * }
 *
 * // Enum type definition
 * const statusType: ABITypeDefinition = {
 *   name: "Status",
 *   type: "enum",
 *   variants: [
 *     { name: "Pending", discriminant: 0 },
 *     { name: "Active", discriminant: 1 },
 *     { name: "Completed", discriminant: 2 },
 *     { name: "Cancelled", discriminant: 3 }
 *   ]
 * }
 *
 * // Nested struct with custom types
 * const orderType: ABITypeDefinition = {
 *   name: "Order",
 *   type: "struct",
 *   fields: [
 *     { name: "id", type: "u64" },
 *     { name: "user", type: "User" },
 *     { name: "status", type: "Status" },
 *     { name: "amount", type: "BigUint" }
 *   ]
 * }
 * ```
 */
export interface ABITypeDefinition {
  /** Optional name of the type */
  name?: string
  /** Whether this is a struct or enum type */
  type?: 'struct' | 'enum'
  /** Fields for struct types */
  fields?: FieldDefinition[]
  /** Variants for enum types */
  variants?: VariantDefinition[]
}
