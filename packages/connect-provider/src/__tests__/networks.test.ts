import { describe, it, expect } from 'vitest'
import {
  NETWORKS,
  DEFAULT_NETWORK,
  getNetworkByChainId,
  createCustomNetwork,
  resolveNetwork,
  getNetworkName,
  getNetworkConfig,
  getNetworkIdentifier,
} from '../networks'

describe('Networks', () => {
  describe('NETWORKS constant', () => {
    it('should contain mainnet configuration', () => {
      expect(NETWORKS.mainnet).toBeDefined()
      expect(NETWORKS.mainnet.name).toBe('mainnet')
      expect(NETWORKS.mainnet.chainId).toBe('108')
      expect(NETWORKS.mainnet.isTestnet).toBe(false)
      expect(NETWORKS.mainnet.config.api).toBe('https://api.mainnet.klever.org')
    })

    it('should contain testnet configuration', () => {
      expect(NETWORKS.testnet).toBeDefined()
      expect(NETWORKS.testnet.name).toBe('testnet')
      expect(NETWORKS.testnet.chainId).toBe('109')
      expect(NETWORKS.testnet.isTestnet).toBe(true)
      expect(NETWORKS.testnet.config.api).toBe('https://api.testnet.klever.org')
    })

    it('should contain devnet configuration', () => {
      expect(NETWORKS.devnet).toBeDefined()
      expect(NETWORKS.devnet.name).toBe('devnet')
      expect(NETWORKS.devnet.chainId).toBe('10001')
      expect(NETWORKS.devnet.isTestnet).toBe(true)
      expect(NETWORKS.devnet.config.api).toBe('https://api.devnet.klever.org')
    })

    it('should contain local configuration', () => {
      expect(NETWORKS.local).toBeDefined()
      expect(NETWORKS.local.name).toBe('local')
      expect(NETWORKS.local.chainId).toBe('420420')
      expect(NETWORKS.local.isTestnet).toBe(true)
      expect(NETWORKS.local.config.api).toBe('http://localhost:8080')
    })

    it('should contain custom configuration template', () => {
      expect(NETWORKS.custom).toBeDefined()
      expect(NETWORKS.custom.name).toBe('custom')
      expect(NETWORKS.custom.isTestnet).toBe(true)
    })

    it('should have native currency configured for all networks', () => {
      Object.values(NETWORKS).forEach((network) => {
        expect(network.nativeCurrency).toBeDefined()
        expect(network.nativeCurrency.name).toBe('Klever')
        expect(network.nativeCurrency.symbol).toBe('KLV')
        expect(network.nativeCurrency.decimals).toBe(6)
      })
    })
  })

  describe('DEFAULT_NETWORK', () => {
    it('should be mainnet', () => {
      expect(DEFAULT_NETWORK).toBe('mainnet')
    })
  })

  describe('getNetworkByChainId', () => {
    it('should return mainnet for chain ID 108', () => {
      const network = getNetworkByChainId('108')
      expect(network).toBeDefined()
      expect(network?.name).toBe('mainnet')
    })

    it('should return testnet for chain ID 109', () => {
      const network = getNetworkByChainId('109')
      expect(network).toBeDefined()
      expect(network?.name).toBe('testnet')
    })

    it('should return devnet for chain ID 10001', () => {
      const network = getNetworkByChainId('10001')
      expect(network).toBeDefined()
      expect(network?.name).toBe('devnet')
    })

    it('should return undefined for unknown chain ID', () => {
      const network = getNetworkByChainId('999')
      expect(network).toBeUndefined()
    })
  })

  describe('createCustomNetwork', () => {
    it('should create custom network with required fields', () => {
      const network = createCustomNetwork({
        chainId: '12345',
        api: 'https://api.custom.com',
        node: 'https://node.custom.com',
      })

      expect(network.name).toBe('custom')
      expect(network.chainId).toBe('12345')
      expect(network.config.api).toBe('https://api.custom.com')
      expect(network.config.node).toBe('https://node.custom.com')
      expect(network.isTestnet).toBe(true)
    })

    it('should create custom network with all optional fields', () => {
      const network = createCustomNetwork({
        chainId: '12345',
        api: 'https://api.custom.com',
        node: 'https://node.custom.com',
        ws: 'wss://ws.custom.com',
        explorer: 'https://explorer.custom.com',
        isTestnet: false,
      })

      expect(network.config.ws).toBe('wss://ws.custom.com')
      expect(network.config.explorer).toBe('https://explorer.custom.com')
      expect(network.isTestnet).toBe(false)
    })

    it('should not include undefined optional fields', () => {
      const network = createCustomNetwork({
        chainId: '12345',
        api: 'https://api.custom.com',
        node: 'https://node.custom.com',
      })

      expect(network.config.ws).toBeUndefined()
      expect(network.config.explorer).toBeUndefined()
    })

    it('should have default native currency', () => {
      const network = createCustomNetwork({
        chainId: '12345',
        api: 'https://api.custom.com',
        node: 'https://node.custom.com',
      })

      expect(network.nativeCurrency.name).toBe('Klever')
      expect(network.nativeCurrency.symbol).toBe('KLV')
      expect(network.nativeCurrency.decimals).toBe(6)
    })
  })

  describe('resolveNetwork', () => {
    it('should resolve network name to network object', () => {
      const network = resolveNetwork('mainnet')
      expect(network).toBe(NETWORKS.mainnet)
    })

    it('should return network object as-is', () => {
      const customNet = createCustomNetwork({
        chainId: '999',
        api: 'https://api.test.com',
        node: 'https://node.test.com',
      })

      const network = resolveNetwork(customNet)
      expect(network).toBe(customNet)
    })

    it('should throw error for unknown network name', () => {
      expect(() => resolveNetwork('unknown' as any)).toThrow('Unknown network: unknown')
    })

    it('should throw error for invalid input', () => {
      expect(() => resolveNetwork(null as any)).toThrow('Unknown network')
      expect(() => resolveNetwork({} as any)).toThrow('Unknown network')
    })
  })

  describe('getNetworkName', () => {
    it('should get name from network string', () => {
      const name = getNetworkName('mainnet')
      expect(name).toBe('mainnet')
    })

    it('should get name from network object', () => {
      const name = getNetworkName(NETWORKS.testnet)
      expect(name).toBe('testnet')
    })

    it('should get name from custom network object', () => {
      const customNet = createCustomNetwork({
        chainId: '999',
        api: 'https://api.test.com',
        node: 'https://node.test.com',
      })

      const name = getNetworkName(customNet)
      expect(name).toBe('custom')
    })

    it('should throw error for unknown network name', () => {
      expect(() => getNetworkName('unknown' as any)).toThrow('Unknown network: unknown')
    })

    it('should throw error for invalid input', () => {
      expect(() => getNetworkName(null as any)).toThrow('Unknown network')
    })
  })

  describe('getNetworkConfig', () => {
    it('should get config from network string', () => {
      const config = getNetworkConfig('mainnet')
      expect(config).toBe(NETWORKS.mainnet.config)
      expect(config.api).toBe('https://api.mainnet.klever.org')
    })

    it('should get config from network object', () => {
      const config = getNetworkConfig(NETWORKS.testnet)
      expect(config).toBe(NETWORKS.testnet.config)
      expect(config.api).toBe('https://api.testnet.klever.org')
    })

    it('should get config from custom network', () => {
      const customNet = createCustomNetwork({
        chainId: '999',
        api: 'https://api.test.com',
        node: 'https://node.test.com',
      })

      const config = getNetworkConfig(customNet)
      expect(config.api).toBe('https://api.test.com')
      expect(config.node).toBe('https://node.test.com')
    })

    it('should throw error for unknown network name', () => {
      expect(() => getNetworkConfig('unknown' as any)).toThrow('Unknown network: unknown')
    })

    it('should throw error for invalid input', () => {
      expect(() => getNetworkConfig(null as any)).toThrow('Unknown network')
    })
  })

  describe('getNetworkIdentifier', () => {
    it('should return chainId for mainnet', () => {
      const identifier = getNetworkIdentifier('mainnet')
      expect(identifier).toBe('108')
    })

    it('should return chainId for testnet', () => {
      const identifier = getNetworkIdentifier('testnet')
      expect(identifier).toBe('109')
    })

    it('should return chainId for devnet', () => {
      const identifier = getNetworkIdentifier('devnet')
      expect(identifier).toBe('10001')
    })

    it('should return custom-chainId for custom network', () => {
      const identifier = getNetworkIdentifier('custom')
      expect(identifier).toBe('custom-420420')
    })

    it('should throw error for unknown network', () => {
      expect(() => getNetworkIdentifier('unknown' as any)).toThrow('Unknown network: unknown')
    })
  })

  describe('network configuration structure', () => {
    it('should have consistent structure across all networks', () => {
      Object.values(NETWORKS).forEach((network) => {
        expect(network).toHaveProperty('name')
        expect(network).toHaveProperty('chainId')
        expect(network).toHaveProperty('config')
        expect(network).toHaveProperty('isTestnet')
        expect(network).toHaveProperty('nativeCurrency')

        expect(network.config).toHaveProperty('api')
        expect(typeof network.isTestnet).toBe('boolean')
      })
    })

    it('should have node URL for networks that need it', () => {
      expect(NETWORKS.mainnet.config.node).toBe('https://node.mainnet.klever.org')
      expect(NETWORKS.testnet.config.node).toBe('https://node.testnet.klever.org')
      expect(NETWORKS.devnet.config.node).toBe('https://node.devnet.klever.org')
      expect(NETWORKS.local.config.node).toBe('http://localhost:8080')
    })

    it('should have explorer URL for public networks', () => {
      expect(NETWORKS.mainnet.config.explorer).toBe('https://kleverscan.org')
      expect(NETWORKS.testnet.config.explorer).toBe('https://testnet.kleverscan.org')
      expect(NETWORKS.devnet.config.explorer).toBe('https://devnet.kleverscan.org')
    })

    it('should have WebSocket URL for networks that support it', () => {
      expect(NETWORKS.mainnet.config.ws).toBe('wss://api.mainnet.klever.org')
      expect(NETWORKS.testnet.config.ws).toBe('wss://api.testnet.klever.org')
      expect(NETWORKS.devnet.config.ws).toBe('wss://api.devnet.klever.org')
      expect(NETWORKS.local.config.ws).toBe('ws://localhost:8080')
    })
  })
})
