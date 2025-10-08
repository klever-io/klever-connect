/**
 * Smart Contract Receipt Parser
 *
 * Parsers for extracting data from smart contract transaction receipts.
 */

import type { TransactionHash } from '@klever/connect-core'

/**
 * Transaction receipt interface
 * Compatible with ITransactionResponse from @klever/connect-provider
 *
 * This is a subset of the full ITransactionResponse interface,
 * containing only the fields needed for contract receipt parsing.
 *
 * Note: We define this interface locally instead of importing from
 * @klever/connect-provider to avoid circular dependencies and keep
 * the contracts package independent. This interface is structurally
 * compatible with ITransactionResponse, so values from the provider
 * package can be passed directly to these parser functions.
 */
export interface TransactionReceipt {
  hash: TransactionHash
  status: string
  contract?: Array<{
    type?: number
    typeString?: string
    parameter?: Record<string, unknown>
  }>
  receipts?: Array<{
    type: number
    typeString?: string
    [key: string]: unknown
  }>
  data?: string[]
  logs?: unknown
}

/**
 * Parsed smart contract deployment receipt
 */
export interface DeployReceiptData {
  /** Deployed contract address */
  contractAddress: string
  /** Contract owner address */
  owner: string
  /** VM Type (0 = WASM) */
  vmType: number
  /** Raw receipt for additional data */
  raw: TransactionReceipt
}

/**
 * Parsed smart contract call receipt
 */
export interface CallReceiptData {
  /** Contract address that was called */
  contractAddress: string
  /** Function name (if available in data) */
  functionName?: string
  /** Return data from contract (base64 encoded) */
  returnData?: string[]
  /** Decoded return values (if decoder provided) */
  decodedResults?: unknown[]
  /** Raw receipt for additional data */
  raw: TransactionReceipt
}

/**
 * Receipt parser error
 */
export class ContractReceiptError extends Error {
  constructor(
    message: string,
    public readonly receipt?: TransactionReceipt,
    public readonly receiptType?: string,
  ) {
    super(message)
    this.name = 'ContractReceiptError'
  }
}

/**
 * Parse smart contract deployment receipt to extract contract address
 */
export function parseDeployReceipt(receipt: TransactionReceipt): DeployReceiptData {
  if (!receipt.receipts || receipt.receipts.length === 0) {
    throw new ContractReceiptError('No receipts found in deployment transaction', receipt, 'deploy')
  }

  // Find SmartContract receipt (type 21)
  const scReceipt = receipt.receipts.find(
    (r): r is typeof r & Record<string, unknown> =>
      r.type === 21 || r.typeString === 'SmartContract',
  )

  if (!scReceipt) {
    throw new ContractReceiptError('No SmartContract receipt found', receipt, 'deploy')
  }

  // Extract contract address from receipt
  const contractAddress = scReceipt['address'] || scReceipt['contractAddress']

  if (!contractAddress || typeof contractAddress !== 'string') {
    throw new ContractReceiptError(
      'Contract address not found in deployment receipt',
      receipt,
      'deploy',
    )
  }

  // Extract owner from receipt or contract data
  const owner =
    (scReceipt['owner'] as string) || (receipt.contract?.[0]?.parameter?.['owner'] as string) || ''

  // Extract VM type (default to 0 for WASM)
  const vmType =
    typeof scReceipt['vmType'] === 'number'
      ? scReceipt['vmType']
      : typeof scReceipt['vm'] === 'number'
        ? scReceipt['vm']
        : 0

  return {
    contractAddress,
    owner,
    vmType,
    raw: receipt,
  }
}

/**
 * Parse smart contract call receipt to extract return data
 */
export function parseCallReceipt(receipt: TransactionReceipt): CallReceiptData {
  // Extract contract address from contract data
  const contractAddress =
    (receipt.contract?.[0]?.parameter?.['address'] as string) ||
    (receipt.contract?.[0]?.parameter?.['scAddress'] as string) ||
    ''

  // Extract function name from data field (format: functionName@arg1@arg2)
  let functionName: string | undefined
  if (receipt.data && receipt.data.length > 0 && receipt.data[0]) {
    const parts = receipt.data[0].split('@')
    functionName = parts[0]
  }

  // Find SmartContract receipt for return data
  const scReceipt = receipt.receipts?.find(
    (r): r is typeof r & Record<string, unknown> =>
      r.type === 21 || r.typeString === 'SmartContract',
  )

  // Extract return data (array of base64 strings)
  const returnData = scReceipt?.['returnData']
    ? Array.isArray(scReceipt['returnData'])
      ? (scReceipt['returnData'] as string[])
      : [scReceipt['returnData'] as string]
    : undefined

  const result: CallReceiptData = {
    contractAddress,
    raw: receipt,
  }

  if (functionName !== undefined) {
    result.functionName = functionName
  }

  if (returnData !== undefined) {
    result.returnData = returnData
  }

  return result
}

/**
 * Receipt parser utilities for smart contracts
 *
 * @example
 * ```ts
 * import { parseReceipt } from '@klever/connect-contracts'
 *
 * // Parse deployment receipt
 * const factory = new ContractFactory(abi, bytecode, signer)
 * const contract = await factory.deploy()
 * const receipt = await provider.getTransaction(contract.deployTransaction.hash)
 * const { contractAddress } = parseReceipt.deploy(receipt)
 * console.log(`Contract deployed at: ${contractAddress}`)
 *
 * // Parse call receipt
 * const tx = await contract.myFunction(arg1, arg2)
 * const callReceipt = await provider.getTransaction(tx.hash)
 * const { returnData } = parseReceipt.call(callReceipt)
 * console.log('Return data:', returnData)
 * ```
 */
export const parseReceipt = {
  deploy: parseDeployReceipt,
  call: parseCallReceipt,
}

// Re-export error
export { ContractReceiptError as ParseError }
