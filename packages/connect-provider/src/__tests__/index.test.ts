import { describe, it, expect } from 'vitest'
import { KleverProvider, HttpClient, NETWORKS } from '../index'

describe('@klever/connect-provider', () => {
  it('should export KleverProvider', () => {
    expect(KleverProvider).toBeDefined()
  })

  it('should export HttpClient', () => {
    expect(HttpClient).toBeDefined()
  })

  it('should export NETWORKS', () => {
    expect(NETWORKS).toBeDefined()
    expect(NETWORKS.mainnet).toBeDefined()
    expect(NETWORKS.testnet).toBeDefined()
  })

  it('should create provider instance', () => {
    const provider = new KleverProvider({ network: NETWORKS.testnet })
    expect(provider).toBeInstanceOf(KleverProvider)
  })
})
