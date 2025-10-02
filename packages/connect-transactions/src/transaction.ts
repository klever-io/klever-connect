import { cryptoProvider } from '@klever/connect-crypto'
import type { PrivateKey } from '@klever/connect-crypto'
import { Transaction as ProtoTransaction, type ITransaction } from '@klever/connect-encoding'
import { hexEncode } from '@klever/connect-encoding'

/**
 * Transaction class representing a Klever blockchain transaction
 * Extends the protobuf Transaction class with convenience methods
 *
 * This class wraps the proto-generated Transaction and provides:
 * - Easy signing with private keys
 * - Serialization to bytes/hex
 * - Fee calculations
 * - Transaction state management
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
    const txBytes = this.toBytes()
    const signature = await cryptoProvider.signMessage(txBytes, privateKey)

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
}
