import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { KleverProvider } from '@klever/connect'
import { App } from '../App'

describe('react-sc-readonly-query (testnet smoke)', () => {
  it('mounts cleanly', async () => {
    render(
      <KleverProvider config={{ network: 'testnet', autoConnect: false }}>
        <App />
      </KleverProvider>
    )
    await waitFor(() => expect(screen.getByTestId('fetch')).toBeInTheDocument(), {
      timeout: 10_000,
    })
  })
})
