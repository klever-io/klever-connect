import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { KleverProvider } from '@klever/connect'
import { App } from '../App'

describe('react-sc-invoke-with-extension (testnet smoke)', () => {
  it('mounts cleanly even without the ABI fetched', async () => {
    render(
      <KleverProvider config={{ network: 'testnet', autoConnect: false }}>
        <App />
      </KleverProvider>
    )
    await waitFor(() => expect(screen.getByTestId('contract-address')).toBeInTheDocument(), {
      timeout: 10_000,
    })
  })
})
