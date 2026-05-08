// Live-network variant. This particular example never hits the network, so
// the "testnet" suite simply re-asserts the same behavior with the SDK pulled
// from the workspace — useful for catching breaking changes after a publish.
//
// Run with `npm run test:testnet`.
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../App'

describe('react-form-validation-helpers (testnet variant — no network)', () => {
  it('still gates submit on real bech32 validation', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByTestId('to-input'), 'klv1nonsense')
    expect(screen.getByTestId('to-error')).toBeInTheDocument()
    expect(screen.getByTestId('submit')).toBeDisabled()
  })
})
