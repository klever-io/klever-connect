// Live-network variant. This test does NOT spin up a browser extension —
// jsdom can't host one — but it does mount the real KleverProvider against
// testnet and asserts that the wallet event bus is wired correctly when the
// extension is absent.
//
// Run via `npm run test:testnet`. Skipped in CI.
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { KleverProvider } from '@klever/connect'
import { App } from '../App'

describe('react-account-changed-listener (testnet, extension absent)', () => {
  it('mounts cleanly and shows the no-extension banner', async () => {
    render(
      <KleverProvider config={{ network: 'testnet', autoConnect: false }}>
        <App />
      </KleverProvider>
    )
    // The provider takes a few hundred ms to settle the extension search.
    await waitFor(
      () => {
        expect(screen.getByTestId('no-extension')).toBeInTheDocument()
      },
      { timeout: 10_000 }
    )
  })
})
