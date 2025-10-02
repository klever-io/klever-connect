import { describe, it, expect, beforeAll } from 'vitest'
import { KleverProvider } from '../provider'

/**
 * Real Integration Tests - Testnet
 *
 * These tests actually connect to Klever testnet and verify real blockchain interactions.
 * They don't modify state but verify read operations work correctly.
 *
 * To run these tests:
 * - Requires network access to https://api.testnet.klever.finance
 * - May be slower due to network latency
 * - Should be run separately from unit tests
 *
 * Run with: pnpm test:integration
 */
describe('Integration: Testnet Provider', () => {
  let provider: KleverProvider

  beforeAll(() => {
    // Create real provider connected to testnet
    provider = new KleverProvider()
  })

  describe('Block operations', () => {
    it('should get current block number from testnet', async () => {
      const blockNumber = await provider.getBlockNumber()

      expect(blockNumber).toBeGreaterThan(0)
      expect(typeof blockNumber).toBe('number')

      console.log('Current testnet block number:', blockNumber)
    }, 10000)

    it('should get block by nonce', async () => {
      // Get current block number first
      const currentNonce = await provider.getBlockNumber()

      // Fetch a recent block (10 blocks ago to ensure it exists)
      const targetNonce = currentNonce - 10
      const block = await provider.getBlock(targetNonce)

      expect(block).toBeDefined()
      expect(block).not.toBeNull()
      expect(block?.nonce).toBe(targetNonce)
      expect(block?.hash).toBeDefined()
      expect(block?.chainID).toBe('108') // Mainnet chain ID (testnet uses mainnet chain ID in responses)
      expect(block?.timestamp).toBeGreaterThan(0)
      expect(block?.txCount).toBeGreaterThanOrEqual(0)

      console.log(`Block ${targetNonce}:`, {
        hash: block?.hash,
        timestamp: block?.timestamp,
        epoch: block?.epoch,
      })
    }, 15000)

    it('should get block by hash', async () => {
      // First get a recent block to get its hash
      const currentNonce = await provider.getBlockNumber()
      const recentBlock = await provider.getBlock(currentNonce - 5)

      expect(recentBlock).toBeDefined()
      expect(recentBlock?.hash).toBeDefined()

      // Now fetch the same block by hash
      const blockByHash = await provider.getBlock(recentBlock!.hash)

      expect(blockByHash).toBeDefined()
      expect(blockByHash?.hash).toBe(recentBlock!.hash)
      expect(blockByHash?.nonce).toBe(recentBlock!.nonce)
      expect(blockByHash?.chainID).toBeDefined()

      console.log(`Block fetched by hash ${recentBlock!.hash.slice(0, 16)}...`)
    }, 20000)

    it('should get latest block', async () => {
      const block = await provider.getBlock('latest')

      expect(block).toBeDefined()
      expect(block).not.toBeNull()
      expect(block?.nonce).toBeGreaterThan(0)
      expect(block?.hash).toBeDefined()
      expect(block?.chainID).toBeDefined()

      console.log('Latest block:', {
        nonce: block?.nonce,
        hash: block?.hash.slice(0, 16) + '...',
        epoch: block?.epoch,
      })
    }, 15000)

    it('should return null for non-existent block', async () => {
      // Try to fetch a block far in the future
      const futureNonce = 999999999999
      const block = await provider.getBlock(futureNonce)

      expect(block).toBeNull()
    }, 10000)

    it('should return null for invalid block hash', async () => {
      const invalidHash = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      const block = await provider.getBlock(invalidHash)

      expect(block).toBeNull()
    }, 10000)
  })

  describe('Block data structure', () => {
    it('should return complete block structure', async () => {
      const currentNonce = await provider.getBlockNumber()
      const block = await provider.getBlock(currentNonce - 1)

      expect(block).toBeDefined()

      // Verify all required fields are present
      expect(block?.hash).toBeDefined()
      expect(block?.nonce).toBeDefined()
      expect(block?.parentHash).toBeDefined()
      expect(block?.timestamp).toBeDefined()
      expect(block?.slot).toBeDefined()
      expect(block?.epoch).toBeDefined()
      expect(block?.chainID).toBeDefined()
      expect(block?.trieRoot).toBeDefined()
      expect(block?.validatorsTrieRoot).toBeDefined()
      expect(block?.producerSignature).toBeDefined()
      expect(block?.signature).toBeDefined()
      expect(typeof block?.isEpochStart).toBe('boolean')
      expect(Array.isArray(block?.validators)).toBe(true)
      expect(block?.producerName).toBeDefined()

      console.log('Block structure verified:', {
        nonce: block?.nonce,
        epoch: block?.epoch,
        chainID: block?.chainID,
        producer: block?.producerName,
      })
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
 * - State modifications
 *
 * These tests verify that the SDK can correctly:
 * 1. Fetch block by nonce
 * 2. Fetch block by hash
 * 3. Fetch latest block
 * 4. Handle non-existent blocks
 * 5. Parse block data structure correctly
 */
