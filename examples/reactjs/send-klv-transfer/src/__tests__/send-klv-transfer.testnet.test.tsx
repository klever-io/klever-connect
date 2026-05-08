// =============================================================================
// send-klv-transfer.testnet.test.tsx — live testnet smoke
// =============================================================================
// Mounts the App against the real KleverProvider (no wallet). The connect
// button should render. Excluded from CI.
// =============================================================================

import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { KleverProvider } from '@klever/connect-react'
import { App } from '../App'

describe('send-klv-transfer — testnet smoke', () => {
  it('renders without errors against real testnet', async () => {
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
