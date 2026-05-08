// =============================================================================
// react-network-switch.testnet.test.tsx — live testnet smoke test
// =============================================================================
// Mounts the real <KleverProvider> and confirms the initial fetch returns a
// real block number from testnet. Excluded from CI.
// =============================================================================

import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { KleverProvider } from '@klever/connect-react'
import { App } from '../App'

describe('react-network-switch — testnet', () => {
  it('fetches a real block number from testnet on mount', async () => {
    render(
      <KleverProvider config={{ network: 'testnet', autoConnect: false }}>
        <App />
      </KleverProvider>,
    )

    await waitFor(
      () => {
        const text = screen.getByTestId('block-readout').textContent ?? ''
        // testnet blocks are positive integers - just check that we got one.
        expect(text).toMatch(/Latest block on testnet: \d+/)
      },
      { timeout: 15_000 },
    )
  }, 20_000)
})
