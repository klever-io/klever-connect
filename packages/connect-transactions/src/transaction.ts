import { TransactionError } from '@klever/connect-core'
import { cryptoProvider } from '@klever/connect-crypto'
import type { PrivateKey } from '@klever/connect-crypto'
import { Transaction as ProtoTransaction, type ITransaction } from '@klever/connect-encoding'
import { hexEncode, hashBlake2b } from '@klever/connect-encoding'

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
  /**
   * Create a Transaction from proto-generated transaction data
   * @param data - Proto transaction data (from node or local build)
   */
  constructor(data?: ITransaction) {
    super(data)
  }

  /**
   * Get raw proto bytes for the transaction
   * This is what gets signed and broadcast to the network
   * @returns Proto bytes as Uint8Array
   */
  toBytes(): Uint8Array {
    return ProtoTransaction.encode(this).finish()
  }

  /**
   * Get proto bytes as hex string
   * Useful for broadcasting to node via HTTP
   * @returns Hex encoded proto bytes
   */
  toHex(): string {
    return hexEncode(this.toBytes())
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
   * @returns true if transaction has at least one signature
   */
  isSigned(): boolean {
    return !!this.Signature && this.Signature.length > 0
  }

  /**
   * Get total fee (KAppFee + BandwidthFee)
   * @returns Total fee amount in KLV smallest units
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
    return hexEncode(this.getHashBytes())
  }

  /**
   * Create a Transaction from hex-encoded proto bytes
   * @param hex - Hex string of proto-encoded transaction
   * @returns Transaction instance
   */
  static fromHex(hex: string): Transaction {
    const bytes = Buffer.from(hex, 'hex')
    const decoded = ProtoTransaction.decode(bytes)
    return new Transaction(decoded)
  }

  /**
   * Create a Transaction from raw proto bytes
   * @param bytes - Proto-encoded transaction bytes
   * @returns Transaction instance
   */
  static fromBytes(bytes: Uint8Array): Transaction {
    const decoded = ProtoTransaction.decode(bytes)
    return new Transaction(decoded)
  }

  /**
   * Create a Transaction from a plain JSON object (from API)
   * Properly converts base64 strings to Uint8Array
   * @param obj - Plain object with base64-encoded byte fields
   * @returns Transaction instance
   */
  static override fromObject(obj: { [k: string]: unknown }): Transaction {
    const decoded = ProtoTransaction.fromObject(obj)
    return new Transaction(decoded)
  }
}
