// =============================================================================
// react-balance-display.testnet.test.tsx — live testnet
// =============================================================================
// Mounts <KleverProvider> against testnet without a connected wallet. The App
// renders the "Connect Wallet" button. Smoke test only.
// =============================================================================

import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { KleverProvider } from '@klever/connect-react'
import { App } from '../App'

describe('react-balance-display — testnet', () => {
  it('mounts and renders the connect prompt without errors', async () => {
    render(
      <KleverProvider config={{ network: 'testnet', autoConnect: false }}>
        <App />
      </KleverProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('connect-btn')).toBeInTheDocument(), {
      timeout: 8000,
    })
  }, 15_000)
})
