// =============================================================================
// freeze-for-staking.testnet.test.tsx - live testnet smoke test
// =============================================================================
// Mounts <App> inside the real <KleverProvider> against testnet. With no
// wallet connected the App should render its connect prompt. Excluded from CI.
// =============================================================================

import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { KleverProvider } from '@klever/connect-react'
import { App } from '../App'

describe('freeze-for-staking - testnet smoke', () => {
  it('renders the unconnected state without errors', async () => {
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