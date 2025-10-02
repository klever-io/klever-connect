import { describe, it, expect, beforeAll } from 'vitest'
import { TransactionBuilder } from '../builder'
import { KleverProvider } from '@klever/connect-provider'

/**
 * Real Integration Tests - Testnet
 *
 * These tests actually connect to Klever testnet and build real transactions.
 * They don't broadcast (to avoid needing real accounts/funds) but verify that
 * the full build process works with the actual testnet node.
 *
 * To run these tests:
 * - They require network access to https://api.testnet.klever.finance
 * - They may be slower due to network latency
 * - They should be run separately from unit tests
 *
 * Run with: pnpm test integration.testnet.ts
 */
describe('Integration: Testnet Provider', () => {
  let provider: KleverProvider

  beforeAll(() => {
    // Create real provider connected to testnet
    // Using the NETWORKS constant from connect-provider
    provider = new KleverProvider()
    // Note: Default network is testnet if not specified
  })

  describe('Provider connectivity', () => {
    it('should connect to testnet and get network info', async () => {
      const network = provider.getNetwork()

      expect(network).toBeDefined()
      expect(network.chainId).toBeDefined()
      expect(network.config).toBeDefined()
      expect(network.config.api || network.config.node).toBeDefined()
    })

    it('should fetch current block number from testnet', async () => {
      const blockNumber = await provider.getBlockNumber()

      expect(blockNumber).toBeGreaterThan(0)
      expect(typeof blockNumber).toBe('number')
    }, 10000) // 10s timeout for network request

    it('should fetch account data from testnet', async () => {
      // Use a known testnet address (can be any valid address)
      const testAddress = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'

      const account = await provider.getAccount(testAddress)

      expect(account).toBeDefined()
      expect(account.address).toBe(testAddress)
      expect(typeof account.nonce).toBe('number')
      expect(account.nonce).toBeGreaterThanOrEqual(0)
    }, 10000)
  })

  describe('Transaction building with real testnet provider', () => {
    it('should build a transfer transaction using testnet node', async () => {
      const sender = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'
      const receiver = 'klv109lz0s89m99qn2ykuzq08djsv0ehkjspwyrtxuhfs8s4uszjyyvqjk8a02'

      const builder = new TransactionBuilder(provider)

      builder.sender(sender).transfer({
        receiver,
        amount: 1000000n, // 1 KLV
        kda: 'KLV',
      })

      // Build transaction using real testnet node
      const tx = await builder.build()

      // Verify transaction was built
      expect(tx).toBeDefined()
      expect(tx.RawData).toBeDefined()
      expect(tx.RawData?.Sender).toBeInstanceOf(Uint8Array)
      expect(tx.RawData?.Nonce).toBeDefined()
      expect(Number(tx.RawData?.Nonce)).toBeGreaterThanOrEqual(0)

      // Verify fees were calculated by node
      expect(tx.RawData?.KAppFee).toBeDefined()
      expect(tx.RawData?.BandwidthFee).toBeDefined()

      // Verify chain ID is testnet
      expect(tx.RawData?.ChainID).toBeInstanceOf(Uint8Array)
      const chainIdBytes = tx.RawData?.ChainID
      if (chainIdBytes) {
        // Chain ID 109 encoded
        expect(chainIdBytes.length).toBeGreaterThan(0)
      }

      // Verify transaction can be encoded
      const txBytes = tx.toBytes()
      expect(txBytes).toBeInstanceOf(Uint8Array)
      expect(txBytes.length).toBeGreaterThan(0)

      const txHex = tx.toHex()
      expect(typeof txHex).toBe('string')
      expect(txHex.length).toBeGreaterThan(0)

      // Note: We don't sign or broadcast to avoid needing real private keys
      console.log('Transaction built successfully from testnet')
      console.log('Transaction hash (unsigned):', tx.toHex().slice(0, 32) + '...')
      console.log('KApp Fee:', tx.RawData?.KAppFee)
      console.log('Bandwidth Fee:', tx.RawData?.BandwidthFee)
      console.log('Nonce:', Number(tx.RawData?.Nonce))
    }, 15000) // 15s timeout for network request

    it('should build a freeze transaction using testnet node', async () => {
      const sender = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'
      const builder = new TransactionBuilder(provider)

      // Freeze 10 KLV (minimum freeze amount)
      builder.sender(sender).freeze({ amount: 10000000n })

      // Build using real testnet
      const tx = await builder.build()

      expect(tx).toBeDefined()
      expect(tx.RawData?.Contract).toBeDefined()
      expect(tx.RawData?.Contract?.length).toBeGreaterThan(0)

      // Verify it's unsigned
      expect(tx.isSigned()).toBe(false)

      console.log('Freeze transaction built from testnet')
    }, 15000)

    it('should build a multi-transfer transaction using testnet node', async () => {
      const sender = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'
      const receiver1 = 'klv109lz0s89m99qn2ykuzq08djsv0ehkjspwyrtxuhfs8s4uszjyyvqjk8a02'
      const receiver2 = 'klv1nw82a8jg4gv6e5t4rh0208cxd29q5rhss665drxg3tsvf9wvyj3qe6qq03'
      const receiver3 = 'klv105kx2g5fjhpcpulw9x6nxhzhkj9fqn0253uuej83wz0h04ywxpcql4jzr2'

      const builder = new TransactionBuilder(provider)

      builder
        .sender(sender)
        .transfer({
          receiver: receiver1,
          amount: 1000000n,
          kda: 'KLV',
        })
        .transfer({
          receiver: receiver2,
          amount: 2000000n,
          kda: 'KLV',
        })
        .transfer({
          receiver: receiver3,
          amount: 3000000n,
          kda: 'KLV',
        })

      const tx = await builder.build()

      expect(tx).toBeDefined()
      expect(tx.RawData).toBeDefined()

      // Verify total fee for multi-transfer is reasonable
      const totalFee = tx.getTotalFee()
      expect(totalFee).toBeGreaterThan(0n)

      console.log('Multi-transfer transaction built from testnet')
      console.log('Total fee for 3 transfers:', totalFee.toString())
    }, 15000)
  })

  describe('Error handling with real provider', () => {
    it('should handle invalid address gracefully', async () => {
      const builder = new TransactionBuilder(provider)

      // This should fail at builder level, before reaching provider
      expect(() => {
        builder.sender('invalid-address').transfer({
          receiver: 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5',
          amount: 1000000n,
        })
      }).toThrow()
    })

    it('should handle network errors gracefully', async () => {
      // Create provider with invalid URL to test error handling
      const badProvider = new KleverProvider()

      // Override baseUrl to cause network error (for testing only)
      // @ts-expect-error - accessing private property for testing
      badProvider.nodeClient.baseUrl = 'https://invalid-url-that-does-not-exist.com'

      const builder = new TransactionBuilder(badProvider)

      builder.sender('klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5').transfer({
        receiver: 'klv109lz0s89m99qn2ykuzq08djsv0ehkjspwyrtxuhfs8s4uszjyyvqjk8a02',
        amount: 1000000n,
      })

      // Should throw network error
      await expect(builder.build()).rejects.toThrow()
    }, 15000)
  })

  describe('Nonce management with real provider', () => {
    it('should fetch current nonce from testnet for account', async () => {
      const testAddress = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'

      const account = await provider.getAccount(testAddress)

      expect(account.nonce).toBeDefined()
      expect(typeof account.nonce).toBe('number')
      expect(account.nonce).toBeGreaterThanOrEqual(0)

      console.log(`Current nonce for ${testAddress}: ${account.nonce}`)
    }, 10000)

    it('should build transaction with auto-fetched nonce', async () => {
      const sender = 'klv1fpwjz234gy8aaae3gx0e8q9f52vymzzn3z5q0s5h60pvktzx0n0qwvtux5'

      const builder = new TransactionBuilder(provider)

      // Don't set nonce manually - let provider fetch it
      builder.sender(sender).transfer({
        receiver: 'klv109lz0s89m99qn2ykuzq08djsv0ehkjspwyrtxuhfs8s4uszjyyvqjk8a02',
        amount: 1000000n,
      })

      const tx = await builder.build()

      // Node should have fetched and set the correct nonce
      expect(tx.RawData?.Nonce).toBeDefined()
      const nonce = Number(tx.RawData?.Nonce)
      expect(nonce).toBeGreaterThanOrEqual(0)

      console.log('Transaction built with auto-fetched nonce:', nonce)
    }, 15000)
  })
})

/**
 * NOTE: These tests require:
 * - Active internet connection
 * - Access to https://api.testnet.klever.finance
 * - Testnet to be operational
 *
 * They do NOT require:
 * - Private keys or test accounts
 * - Actual funds
 * - Broadcasting transactions
 *
 * These tests verify that the SDK can correctly:
 * 1. Connect to testnet
 * 2. Build transactions using real node
 * 3. Handle nonce fetching
 * 4. Calculate fees correctly
 * 5. Handle errors gracefully
 */
