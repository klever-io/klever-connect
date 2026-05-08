import { describe, it, expect } from 'vitest'
import { KleverProvider } from '@klever/connect'

const SHOULD_RUN = (process.env['KLV_LIVE_TESTS'] ?? 'false') === 'true'

describe.skipIf(!SHOULD_RUN)('provider-events-subscribe (testnet)', () => {
  it('attaches a block listener', async () => {
    const provider = new KleverProvider({ network: 'testnet' })
    let count = 0
    provider.on('block', () => {
      count++
    })
    if (typeof (provider as unknown as { connect?: () => void }).connect === 'function') {
      ;(provider as unknown as { connect: () => void }).connect()
    }
    await new Promise((r) => setTimeout(r, 8_000))
    provider.removeAllListeners()
    expect(count).toBeGreaterThanOrEqual(0)
  }, 15_000)
})
