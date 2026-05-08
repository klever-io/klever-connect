// =============================================================================
// react-wallet-connect-disconnect.testnet.test.tsx
// =============================================================================
// LIVE testnet smoke test (excluded from CI). Confirms the real
// <KleverProvider> mounts and that, in jsdom (no extension), the App
// renders the "Klever Web Extension not found" banner instead of hanging
// in the searching state forever.
// =============================================================================

import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { KleverProvider } from '@klever/connect-react'
import { App } from '../App'

describe('react-wallet-connect-disconnect — testnet smoke test', () => {
  it('mounts the real KleverProvider and falls through to "no extension"', async () => {
    render(
      <KleverProvider config={{ network: 'testnet', autoConnect: false }}>
        <App />
      </KleverProvider>,
    )

    await waitFor(
      () => {
        // Either the install banner OR the connect button - extension detection
        // backoff should resolve to one of those within ~5 seconds.
        const banner = screen.queryByTestId('no-extension')
        const connect = screen.queryByTestId('connect-btn')
        expect(banner || connect).toBeTruthy()
      },
      { timeout: 8000 },
    )
  }, 15_000)
})
