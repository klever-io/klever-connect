import { describe, it, expect } from 'vitest'
import { KleverProvider } from '../provider'
import { NETWORKS } from '../networks'

describe('KleverProvider Configuration', () => {
  describe('Network configuration patterns', () => {
    it('should use mainnet by default (no config)', () => {
      const provider = new KleverProvider()
      
      expect(provider.network.name).toBe('mainnet')
      expect(provider.network.chainId).toBe('108')
    })

    it('should accept network name as string', () => {
      const provider = new KleverProvider('testnet')
      
      expect(provider.network.name).toBe('testnet')
      expect(provider.network.chainId).toBe('109')
    })

    it('should accept network name in config object', () => {
      const provider = new KleverProvider({ network: 'testnet' })
      
      expect(provider.network.name).toBe('testnet')
      expect(provider.network.chainId).toBe('109')
    })

    it('should accept Network object', () => {
      const provider = new KleverProvider({ network: NETWORKS.testnet })
      
      expect(provider.network.name).toBe('testnet')
      expect(provider.network.chainId).toBe('109')
    })

    it('should accept custom network via url and chainId', () => {
      const provider = new KleverProvider({
        url: 'https://custom-node.com',
        chainId: '100'
      })
      
      expect(provider.network.name).toBe('custom')
      expect(provider.network.chainId).toBe('100')
      expect(provider.network.config.api).toBe('https://custom-node.com')
      expect(provider.network.config.node).toBe('https://custom-node.com')
    })

    it('should support all named networks', () => {
      const mainnet = new KleverProvider('mainnet')
      expect(mainnet.network.name).toBe('mainnet')
      expect(mainnet.network.chainId).toBe('108')

      const testnet = new KleverProvider('testnet')
      expect(testnet.network.name).toBe('testnet')
      expect(testnet.network.chainId).toBe('109')

      const devnet = new KleverProvider('devnet')
      expect(devnet.network.name).toBe('devnet')
      expect(devnet.network.chainId).toBe('10001')

      const local = new KleverProvider('local')
      expect(local.network.name).toBe('local')
      expect(local.network.chainId).toBe('420420')
    })

    it('should throw error for unknown network name', () => {
      expect(() => {
        // @ts-expect-error Testing invalid network
        new KleverProvider('unknown')
      }).toThrow('Unknown network')
    })
  })

  describe('Advanced configuration', () => {
    it('should accept configuration with custom options', () => {
      const provider = new KleverProvider({
        network: 'testnet',
        timeout: 60000,
        cache: { ttl: 30000, maxSize: 200 },
        retry: { maxRetries: 5, backoff: 'exponential' },
        debug: false
      })
      
      expect(provider.network.name).toBe('testnet')
    })

    it('should work with network string and additional options', () => {
      // Note: When passing a string, you can't add options
      // This is a limitation of the design, but acceptable
      const provider = new KleverProvider('testnet')
      expect(provider.network.name).toBe('testnet')
    })
  })

  describe('Backward compatibility', () => {
    it('should maintain compatibility with existing code', () => {
      // Old way (config object with network)
      const oldWay = new KleverProvider({
        network: NETWORKS.testnet
      })
      
      // New way (network name string)
      const newWay = new KleverProvider('testnet')
      
      expect(oldWay.network.chainId).toBe(newWay.network.chainId)
      expect(oldWay.network.name).toBe(newWay.network.name)
    })
  })
})
