import { describe, it, expect, vi } from 'vitest'
import { Transaction } from '../transaction'
import { cryptoProvider } from '@klever/connect-crypto'
import type { ITransaction } from '@klever/connect-encoding'

describe('Transaction', () => {
  describe('constructor', () => {
    it('should create empty transaction', () => {
      const tx = new Transaction()
      expect(tx).toBeInstanceOf(Transaction)
    })

    it('should create transaction from proto data', () => {
      const protoData: ITransaction = {
        RawData: {
          Nonce: 123,
          Sender: new Uint8Array([1, 2, 3]),
          Contract: [],
          ChainID: new Uint8Array([1, 0, 4, 2, 0]),
          KAppFee: 500000,
          BandwidthFee: 100000,
        },
      }

      const tx = new Transaction(protoData)
      expect(tx.RawData?.Nonce).toBe(123)
    })
  })

  describe('toBytes', () => {
    it('should convert transaction to bytes', () => {
      const tx = new Transaction({
        RawData: {
          Nonce: 123,
          Sender: new Uint8Array([1, 2, 3]),
          Contract: [],
          ChainID: new Uint8Array([1, 0, 4, 2, 0]),
        },
      })

      const bytes = tx.toBytes()
      expect(bytes).toBeInstanceOf(Uint8Array)
      expect(bytes.length).toBeGreaterThan(0)
    })
  })

  describe('toHex', () => {
    it('should convert transaction to hex string', () => {
      const tx = new Transaction({
        RawData: {
          Nonce: 123,
          Sender: new Uint8Array([1, 2, 3]),
          Contract: [],
          ChainID: new Uint8Array([1, 0, 4, 2, 0]),
        },
      })

      const hex = tx.toHex()
      expect(typeof hex).toBe('string')
      expect(hex.length).toBeGreaterThan(0)
      // Hex should only contain valid hex characters
      expect(hex).toMatch(/^[0-9a-f]+$/i)
    })
  })

  describe('sign', () => {
    it('should sign transaction with private key', async () => {
      const tx = new Transaction({
        RawData: {
          Nonce: 123,
          Sender: new Uint8Array([1, 2, 3]),
          Contract: [],
          ChainID: new Uint8Array([1, 0, 4, 2, 0]),
        },
      })

      // Mock crypto provider
      const mockSignature = new Uint8Array([10, 20, 30, 40])
      vi.spyOn(cryptoProvider, 'signMessage').mockResolvedValue({
        bytes: mockSignature,
        hex: '0a141e28',
      })

      // Create mock private key
      const mockPrivateKey = new Uint8Array(32)

      const result = await tx.sign(mockPrivateKey)

      expect(result).toBe(tx) // Should return same instance
      expect(tx.Signature).toBeDefined()
      expect(tx.Signature).toHaveLength(1)
      expect(tx.Signature?.[0]).toBe(mockSignature)
      expect(cryptoProvider.signMessage).toHaveBeenCalledWith(
        expect.any(Uint8Array),
        mockPrivateKey,
      )
    })
  })

  describe('isSigned', () => {
    it('should return false for unsigned transaction', () => {
      const tx = new Transaction({
        RawData: {
          Nonce: 123,
          Sender: new Uint8Array([1, 2, 3]),
          Contract: [],
          ChainID: new Uint8Array([1, 0, 4, 2, 0]),
        },
      })

      expect(tx.isSigned()).toBe(false)
    })

    it('should return true for signed transaction', async () => {
      const tx = new Transaction({
        RawData: {
          Nonce: 123,
          Sender: new Uint8Array([1, 2, 3]),
          Contract: [],
          ChainID: new Uint8Array([1, 0, 4, 2, 0]),
        },
      })

      // Mock signature
      tx.Signature = [new Uint8Array([10, 20, 30])]

      expect(tx.isSigned()).toBe(true)
    })
  })

  describe('getTotalFee', () => {
    it('should return sum of kAppFee and bandwidthFee', () => {
      const tx = new Transaction({
        RawData: {
          Nonce: 123,
          Sender: new Uint8Array([1, 2, 3]),
          Contract: [],
          ChainID: new Uint8Array([1, 0, 4, 2, 0]),
          KAppFee: 500000,
          BandwidthFee: 100000,
        },
      })

      const totalFee = tx.getTotalFee()
      expect(totalFee).toBe(600000n)
    })

    it('should handle bigint fees', () => {
      const tx = new Transaction({
        RawData: {
          Nonce: 123,
          Sender: new Uint8Array([1, 2, 3]),
          Contract: [],
          ChainID: new Uint8Array([1, 0, 4, 2, 0]),
          KAppFee: 500000n,
          BandwidthFee: 100000n,
        },
      })

      const totalFee = tx.getTotalFee()
      expect(totalFee).toBe(600000n)
    })

    it('should return 0 when fees are undefined', () => {
      const tx = new Transaction({
        RawData: {
          Nonce: 123,
          Sender: new Uint8Array([1, 2, 3]),
          Contract: [],
          ChainID: new Uint8Array([1, 0, 4, 2, 0]),
        },
      })

      const totalFee = tx.getTotalFee()
      expect(totalFee).toBe(0n)
    })
  })

  describe('fromHex', () => {
    it('should decode transaction from hex string', () => {
      // First create a transaction and encode it
      const originalTx = new Transaction({
        RawData: {
          Nonce: 123,
          Sender: new Uint8Array([1, 2, 3]),
          Contract: [],
          ChainID: new Uint8Array([1, 0, 4, 2, 0]),
        },
      })
      const hex = originalTx.toHex()

      // Now decode it back
      const decodedTx = Transaction.fromHex(hex)

      expect(decodedTx).toBeInstanceOf(Transaction)
      expect(Number(decodedTx.RawData?.Nonce)).toBe(123)
    })
  })

  describe('fromBytes', () => {
    it('should decode transaction from bytes', () => {
      // First create a transaction and encode it
      const originalTx = new Transaction({
        RawData: {
          Nonce: 123,
          Sender: new Uint8Array([1, 2, 3]),
          Contract: [],
          ChainID: new Uint8Array([1, 0, 4, 2, 0]),
        },
      })
      const bytes = originalTx.toBytes()

      // Now decode it back
      const decodedTx = Transaction.fromBytes(bytes)

      expect(decodedTx).toBeInstanceOf(Transaction)
      expect(Number(decodedTx.RawData?.Nonce)).toBe(123)
    })
  })

  describe('encode/decode round-trip', () => {
    it('should encode and decode transaction correctly', () => {
      const original = new Transaction({
        RawData: {
          Nonce: 456,
          Sender: new Uint8Array([5, 6, 7, 8]),
          Contract: [],
          ChainID: new Uint8Array([1, 0, 4, 2, 0]),
          KAppFee: 750000,
          BandwidthFee: 150000,
          Data: [new Uint8Array([1, 2, 3])],
        },
      })

      // Encode to bytes
      const bytes = original.toBytes()

      // Decode back
      const decoded = Transaction.fromBytes(bytes)

      // Verify data matches (convert Long to number for comparison)
      expect(Number(decoded.RawData?.Nonce)).toBe(Number(original.RawData?.Nonce))
      expect(Number(decoded.RawData?.KAppFee)).toBe(Number(original.RawData?.KAppFee))
      expect(Number(decoded.RawData?.BandwidthFee)).toBe(Number(original.RawData?.BandwidthFee))
    })

    it('should encode and decode via hex correctly', () => {
      const original = new Transaction({
        RawData: {
          Nonce: 789,
          Sender: new Uint8Array([9, 10, 11]),
          Contract: [],
          ChainID: new Uint8Array([1, 0, 4, 2, 0]),
        },
      })

      // Encode to hex
      const hex = original.toHex()

      // Decode back
      const decoded = Transaction.fromHex(hex)

      // Verify data matches (convert Long to number for comparison)
      expect(Number(decoded.RawData?.Nonce)).toBe(Number(original.RawData?.Nonce))
    })
  })

  describe('full transaction lifecycle', () => {
    it('should create, sign, and verify transaction', async () => {
      // Create transaction
      const tx = new Transaction({
        RawData: {
          Nonce: 123,
          Sender: new Uint8Array([1, 2, 3]),
          Contract: [],
          ChainID: new Uint8Array([1, 0, 4, 2, 0]),
          KAppFee: 500000,
          BandwidthFee: 100000,
        },
      })

      // Verify initial state
      expect(tx.isSigned()).toBe(false)
      expect(tx.getTotalFee()).toBe(600000n)

      // Mock signing
      const mockSignature = new Uint8Array([10, 20, 30, 40])
      vi.spyOn(cryptoProvider, 'signMessage').mockResolvedValue({
        bytes: mockSignature,
        hex: '0a141e28',
      })

      // Sign transaction
      const mockPrivateKey = new Uint8Array(32)
      await tx.sign(mockPrivateKey)

      // Verify signed state
      expect(tx.isSigned()).toBe(true)

      // Get bytes for broadcasting
      const txBytes = tx.toBytes()
      expect(txBytes).toBeInstanceOf(Uint8Array)
      expect(txBytes.length).toBeGreaterThan(0)

      // Get hex for broadcasting
      const txHex = tx.toHex()
      expect(typeof txHex).toBe('string')
      expect(txHex.length).toBeGreaterThan(0)
    })
  })
})
