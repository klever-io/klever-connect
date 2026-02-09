import { TransactionError } from '@klever/connect-core'
import { cryptoProvider } from '@klever/connect-crypto'
import type { PrivateKey } from '@klever/connect-crypto'
import {
  Transaction as ProtoTransaction,
  type ITransaction,
  ContractType,
} from '@klever/connect-encoding'
import { hexEncode, hexDecode, hashBlake2b } from '@klever/connect-encoding'

/**
 * Transaction class representing a Klever blockchain transaction
 * Extends the protobuf Transaction class with convenience methods
 *
 * This class wraps the proto-generated Transaction and provides:
 * - Easy signing with private keys
 * - Serialization to bytes/hex
 * - Fee calculations
 * - Transaction state management
 *
 * This is a pure data class - no network dependencies.
 * Use provider.sendRawTransaction(tx.toHex()) to broadcast.
 */
export class Transaction extends ProtoTransaction {
  private hash?: string // Cached transaction hash

  /**
   * Create a Transaction from proto-generated transaction data
   * @param data - Proto transaction data (from node or local build)
   */
  constructor(data?: ITransaction) {
    super(data)
    // Precompute and cache the transaction hash if RawData is present
    if (this.RawData) {
      this.getHash()
    }
  }

  /**
   * Get raw proto bytes for the transaction
   * This is what gets signed and broadcast to the network
   *
   * @returns Proto bytes as Uint8Array
   *
   * @example
   * ```typescript
   * const tx = new Transaction(txData)
   * const bytes = tx.toBytes()
   * // bytes: Uint8Array [10, 32, 65, ...]
   * // Use for signing or network transmission
   * ```
   */
  toBytes(): Uint8Array {
    return ProtoTransaction.encode(this).finish()
  }

  /**
   * Get proto bytes as hex string
   * Useful for broadcasting to node via HTTP or storing in databases
   *
   * @returns Hex encoded proto bytes (without 0x prefix)
   *
   * @example
   * ```typescript
   * const tx = new Transaction(txData)
   * await tx.sign(privateKey)
   * const hex = tx.toHex()
   * // hex: "0a20418f2b3c..."
   *
   * // Broadcast to network
   * const hash = await provider.sendRawTransaction(hex)
   * ```
   */
  toHex(): string {
    return hexEncode(this.toBytes())
  }

  public override toJSON(): { [k: string]: unknown } {
    const json = super.toJSON()

    // Convert numeric string fields to actual numbers
    if (json['RawData'] && typeof json['RawData'] === 'object') {
      const rawData = json['RawData'] as { [k: string]: unknown }

      // Convert nonce from string to number
      if (typeof rawData['Nonce'] === 'string') {
        rawData['Nonce'] = Number(rawData['Nonce'])
      }

      // Convert other numeric fields
      const numericFields = ['KAppFee', 'BandwidthFee', 'PermID']
      for (const field of numericFields) {
        if (typeof rawData[field] === 'string') {
          rawData[field] = Number(rawData[field])
        }
      }

      // Convert contract types from enum strings to numbers
      if (Array.isArray(rawData['Contract'])) {
        rawData['Contract'] = rawData['Contract'].map((contract: unknown) => {
          if (contract && typeof contract === 'object') {
            const c = contract as { [k: string]: unknown }
            // Convert Type enum from string name to numeric value
            if (typeof c['Type'] === 'string') {
              // Look up the enum value
              const enumValue = ContractType[c['Type'] as keyof typeof ContractType]
              c['Type'] = typeof enumValue === 'number' ? enumValue : c['Type']
            }
          }
          return contract
        })
      }
    }

    // Include additional fields as needed
    if (this.hash) {
      json['hash'] = this.hash
    }

    return json
  }

  /**
   * Sign the transaction with a private key
   * Signs the transaction hash (blake2b of RawData)
   * @param privateKey - Private key to sign with
   * @returns This transaction instance with signature added
   *
   * @example
   * ```typescript
   * const tx = new Transaction(txData)
   * await tx.sign(privateKey)
   * // tx now has Signature field populated
   * ```
   */
  async sign(privateKey: PrivateKey): Promise<Transaction> {
    // Get transaction hash bytes (blake2b of RawData)
    const hashBytes = this.getHashBytes()

    // Sign the hash
    const signature = await cryptoProvider.signMessage(hashBytes, privateKey)

    // Add signature to transaction (proto uses Signature field)
    this.Signature = [signature.bytes]

    return this
  }

  /**
   * Check if transaction is signed
   * Verifies whether the transaction has been signed and is ready for broadcast
   *
   * @returns true if transaction has at least one signature, false otherwise
   *
   * @example
   * ```typescript
   * const tx = new Transaction(txData)
   * console.log(tx.isSigned()) // false
   *
   * await tx.sign(privateKey)
   * console.log(tx.isSigned()) // true
   *
   * // Only broadcast if signed
   * if (tx.isSigned()) {
   *   await provider.sendRawTransaction(tx.toHex())
   * }
   * ```
   */
  isSigned(): boolean {
    return !!this.Signature && this.Signature.length > 0
  }

  /**
   * Get total fee (KAppFee + BandwidthFee)
   * Returns the combined fee for the transaction in smallest KLV units
   *
   * @returns Total fee amount in KLV smallest units (1 KLV = 1,000,000 units)
   *
   * @example
   * ```typescript
   * const tx = new Transaction(txData)
   * const totalFee = tx.getTotalFee()
   * console.log(`Total fee: ${totalFee} units`) // e.g., "600000 units"
   *
   * // Convert to human-readable KLV
   * const feeInKLV = Number(totalFee) / 1_000_000
   * console.log(`Fee: ${feeInKLV} KLV`) // e.g., "0.6 KLV"
   * ```
   */
  getTotalFee(): bigint {
    const kAppFee = this.RawData?.KAppFee ?? 0
    const bandwidthFee = this.RawData?.BandwidthFee ?? 0
    // Convert Long to bigint if needed
    const kAppFeeBigInt = typeof kAppFee === 'bigint' ? kAppFee : BigInt(kAppFee.toString())
    const bandwidthFeeBigInt =
      typeof bandwidthFee === 'bigint' ? bandwidthFee : BigInt(bandwidthFee.toString())
    return kAppFeeBigInt + bandwidthFeeBigInt
  }

  /**
   * Get the transaction hash bytes
   * Computes blake2b hash of the RawData proto bytes
   * @returns Transaction hash as Uint8Array
   *
   * @example
   * ```typescript
   * const tx = new Transaction(txData)
   * const hashBytes = tx.getHashBytes()
   * // Use for signing or other operations
   * ```
   */
  getHashBytes(): Uint8Array {
    if (!this.RawData) {
      throw new TransactionError('Transaction has no RawData')
    }

    // Encode RawData to proto bytes
    const rawDataBytes = ProtoTransaction.Raw.encode(this.RawData).finish()

    // Hash using blake2b (32 bytes output)
    return hashBlake2b(rawDataBytes, 32)
  }

  /**
   * Get the transaction hash
   * Computes blake2b hash of the RawData proto bytes
   * @returns Transaction hash as hex string
   *
   * @example
   * ```typescript
   * const tx = new Transaction(txData)
   * const hash = tx.getHash()
   * // hash: "a3f2e8d9..."
   * ```
   */
  getHash(): string {
    this.hash = hexEncode(this.getHashBytes())
    return this.hash
  }

  /**
   * Create a Transaction from hex-encoded proto bytes
   * Decodes a hex string back into a Transaction object
   *
   * @param hex - Hex string of proto-encoded transaction (with or without 0x prefix)
   * @returns Transaction instance
   *
   * @example
   * ```typescript
   * // Decode hex string from storage or API
   * const hex = "0a20418f2b3c..."
   * const tx = Transaction.fromHex(hex)
   *
   * // Verify signature
   * console.log(tx.isSigned()) // true or false
   *
   * // Get transaction hash
   * console.log(tx.getHash())
   * ```
   */
  static fromHex(hex: string): Transaction {
    const bytes = hexDecode(hex)
    const decoded = ProtoTransaction.decode(bytes)
    return new Transaction(decoded)
  }

  /**
   * Create a Transaction from raw proto bytes
   * Decodes protobuf bytes back into a Transaction object
   *
   * @param bytes - Proto-encoded transaction bytes
   * @returns Transaction instance
   *
   * @example
   * ```typescript
   * // Decode bytes from storage or network
   * const bytes = new Uint8Array([10, 32, 65, ...])
   * const tx = Transaction.fromBytes(bytes)
   *
   * // Verify and use
   * console.log(tx.getHash())
   * console.log(tx.isSigned())
   * ```
   */
  static fromBytes(bytes: Uint8Array): Transaction {
    const decoded = ProtoTransaction.decode(bytes)
    return new Transaction(decoded)
  }

  /**
   * Create a Transaction from a plain JSON object (from API)
   * Properly converts base64 strings to Uint8Array for proto fields.
   * This is typically used when receiving transaction data from the node's API.
   *
   * @param obj - Plain object with base64-encoded byte fields
   * @returns Transaction instance
   *
   * @example
   * ```typescript
   * // Response from node's /transaction/build endpoint
   * const response = await fetch('/transaction/build', {
   *   method: 'POST',
   *   body: JSON.stringify(buildRequest)
   * })
   * const data = await response.json()
   *
   * // Convert API response to Transaction
   * const tx = Transaction.fromObject(data.result)
   *
   * // Sign and broadcast
   * await tx.sign(privateKey)
   * await provider.sendRawTransaction(tx.toHex())
   * ```
   */
  static override fromObject(obj: { [k: string]: unknown }): Transaction {
    const decoded = ProtoTransaction.fromObject(obj)
    return new Transaction(decoded)
  }

  /**
   * Create a new Transaction from an existing Transaction
   * Creates a deep copy of the transaction
   *
   * @param tx - Existing Transaction instance
   * @returns New Transaction instance
   *
   * @example
   * ```typescript
   * const originalTx = new Transaction(txData)
   * const copiedTx = Transaction.fromTransaction(originalTx)
   *
   * // Modifications to copiedTx won't affect originalTx
   * await copiedTx.sign(privateKey)
   * ```
   */
  static fromTransaction(tx: Transaction): Transaction {
    const decoded = ProtoTransaction.fromObject(tx as unknown as { [k: string]: unknown })
    return new Transaction(decoded)
  }
}
