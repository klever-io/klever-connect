// Live-network testnet variant. Mounts the real KleverProvider against
// testnet and asserts the form renders even without a connected extension.
// Run with `npm run test:testnet`.
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { KleverProvider } from '@klever/connect'
import { App } from '../App'

describe('marketplace-list-asset (testnet)', () => {
  it('mounts cleanly and shows the connect button', async () => {
    render(
      <KleverProvider config={{ network: 'testnet', autoConnect: false }}>
        <App />
      </KleverProvider>
    )
    await waitFor(
      () => {
        expect(screen.getByTestId('connect')).toBeInTheDocument()
      },
      { timeout: 10_000 }
    )
  })
})
