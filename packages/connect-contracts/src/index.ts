/**
 * @klever/connect-contracts
 *
 * Smart contract interaction package for Klever blockchain.
 * Provides ethers.js-like API for contract deployment, transactions, and queries.
 */

// Export types
export type {
  BuildInfo,
  ContractABI,
  ABIEndpoint,
  ABIParameter,
  ABITypeDefinition,
  FieldDefinition,
  VariantDefinition,
} from './types/abi'
export type { CallOptions, ContractFunction, DecodedResult } from './types/contract'
export type { EventFilter, EventFragment, EventParameter, ParsedEvent } from './types/events'

// Export ABI utilities
export { ABIParser } from './abi/parser'
export { ABIValidator } from './abi/validator'

// Export encoding utilities
export {
  bytesToHex,
  contractParam,
  encodeAddress,
  encodeBool,
  encodeBytes,
  encodeString,
  encodeU16,
  encodeU32,
  encodeU64,
  encodeU8,
  hexToBytes,
} from './encoder/param-encoder'
export { encodeConstructor, encodeFunctionCall, FunctionEncoder } from './encoder/function-encoder'

// Export ABI-aware encoding/decoding
export { ABIEncoder, encodeArguments, encodeByType } from './encoder/abi-encoder'
export {
  ABIDecoder,
  decodeByType,
  decodeResults,
  decodeResultsWithMetadata,
} from './decoder/abi-decoder'
export type {
  DecodedValue,
  DecodedReturnValue,
  DecodedReturnData,
  StringEncoding,
} from './decoder/abi-decoder'

// Export decoding utilities
export {
  contractResult,
  decodeAddress,
  decodeBase64,
  decodeBool,
  decodeBytes,
  decodeString,
  decodeU16,
  decodeU32,
  decodeU64,
  decodeU8,
  encodeBase64,
  hexToBase64,
} from './decoder/result-decoder'

// Export contract classes
export { Interface } from './interface'
export { Contract } from './contract'
export { ContractFactory } from './contract-factory'

// Export utility functions
export { loadABI, isValidABI } from './utils'

// Export event parser
export { EventParser } from './event-parser'
export type { ContractEvent, ContractEventFilter, LogEvent, TransactionLog } from './event-parser'

// Export receipt parser
export {
  parseReceipt,
  parseDeployReceipt,
  parseCallReceipt,
  ContractReceiptError,
  ParseError,
} from './receipt-parser'
export type { TransactionReceipt, DeployReceiptData, CallReceiptData } from './receipt-parser'
