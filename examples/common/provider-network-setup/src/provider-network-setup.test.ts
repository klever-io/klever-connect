/**
 * Mocked-provider tests for flow #1 (provider-network-setup).
 *
 * The SDK's `KleverProvider` constructor itself does NOT hit the network — it
 * just stores the config — so we don't need to vi.mock fetch for these tests.
 * We do verify that:
 *   - constructing with a network name returns a working provider
 *   - the NETWORKS catalogue contains the canonical entries
 *   - createCustomNetwork yields a config that the provider accepts
 */

import { describe, it, expect } from 'vitest'
import { KleverProvider, NETWORKS, createCustomNetwork } from '@klever/connect'

describe('provider-network-setup (mocked)', () => {
  it('constructs a testnet provider from a network name', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    const info = await provider.getNetwork()
    expect(info.name).toBeDefined()
    expect(info.chainId).toBeDefined()
  })

  it('exposes the canonical NETWORKS catalogue', () => {
    // Sanity-check that the four canonical entries are present.
    expect(NETWORKS).toHaveProperty('mainnet')
    expect(NETWORKS).toHaveProperty('testnet')
    expect(NETWORKS).toHaveProperty('devnet')
    expect(NETWORKS).toHaveProperty('local')

    for (const [key, cfg] of Object.entries(NETWORKS)) {
      expect(cfg, `entry ${key}`).toMatchObject({
        chainId: expect.any(String),
        api: expect.any(String),
      })
    }
  })

  it('builds a custom network from a URL', async () => {
    const customCfg = createCustomNetwork({
      name: 'unit-test-custom',
      chainId: '999',
      api: 'https://node.example.invalid',
      node: 'https://node.example.invalid',
    })

    expect(customCfg.chainId).toBe('999')
    expect(customCfg.api).toBe('https://node.example.invalid')

    // The provider should accept the custom config without error.
    const customProvider = new KleverProvider({ network: customCfg })
    const info = await customProvider.getNetwork()
    expect(info.chainId).toBe('999')
  })
})
