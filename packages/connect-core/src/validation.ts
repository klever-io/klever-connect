import type { KleverAddress, TransactionHash, HexString } from './types'
import { ValidationError } from './errors'
import { ADDRESS_PREFIX } from './constants'

export function isKleverAddress(value: string): value is KleverAddress {
  if (!value || typeof value !== 'string') return false
  return value.startsWith(ADDRESS_PREFIX)
}

export function assertKleverAddress(value: string): asserts value is KleverAddress {
  if (!isKleverAddress(value)) {
    throw new ValidationError(`Invalid Klever address: ${value}`)
  }
}

export function isTransactionHash(value: string): value is TransactionHash {
  if (!value || typeof value !== 'string') return false
  return /^[a-fA-F0-9]{64}$/.test(value)
}

export function assertTransactionHash(value: string): asserts value is TransactionHash {
  if (!isTransactionHash(value)) {
    throw new ValidationError(`Invalid transaction hash: ${value}`)
  }
}

export function isHexString(value: string): value is HexString {
  if (!value || typeof value !== 'string') return false
  return /^0x[a-fA-F0-9]*$/.test(value)
}

export function assertHexString(value: string): asserts value is HexString {
  if (!isHexString(value)) {
    throw new ValidationError(`Invalid hex string: ${value}`)
  }
}

export function validateAmount(amount: bigint): void {
  if (amount < 0n) {
    throw new ValidationError('Amount cannot be negative')
  }
}

export function validateNonce(nonce: number): void {
  if (nonce < 0 || !Number.isInteger(nonce)) {
    throw new ValidationError('Nonce must be a non-negative integer')
  }
}