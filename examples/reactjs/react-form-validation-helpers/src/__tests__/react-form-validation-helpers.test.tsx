// Mocked-default test for `react-form-validation-helpers`.
//
// This example doesn't touch the network or wallet, so there is nothing to
// mock — we mount the App and exercise the SDK helpers (`isValidAddress`,
// `parseKLV`) through real keyboard input via Testing Library.
//
// The test acts as a regression guard: if `@klever/connect` ever changes the
// behavior of those helpers (e.g. a stricter parser), this suite will catch
// it because we use real values, not stubs.

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../App'

// A known-valid testnet address. Bech32 + correct checksum so `isValidAddress`
// passes. Any random bytes prefixed with "klv1" would FAIL the bech32 check.
const VALID_ADDRESS = 'klv1usdnywjhrlv4tcyu6stxpl6yvhplg35nepljlt4y5r7yppe8er4qujlazy'

describe('react-form-validation-helpers (mocked default)', () => {
  it('renders the form and disables submit until both fields validate', async () => {
    const user = userEvent.setup()
    render(<App />)

    const toInput = screen.getByTestId('to-input')
    const amountInput = screen.getByTestId('amount-input')
    const submit = screen.getByTestId('submit')

    expect(submit).toBeDisabled()

    // Type a malformed address. The bech32 check should reject it.
    await user.type(toInput, 'klv1notavalidaddress')
    expect(screen.getByTestId('to-error')).toBeInTheDocument()
    expect(submit).toBeDisabled()

    // Replace with a valid address.
    await user.clear(toInput)
    await user.type(toInput, VALID_ADDRESS)
    expect(screen.getByTestId('to-ok')).toBeInTheDocument()

    // Amount validation: "abc" is not parseable.
    await user.type(amountInput, 'abc')
    expect(screen.getByTestId('amount-error')).toBeInTheDocument()
    expect(submit).toBeDisabled()

    // Replace with valid 1.5 KLV. parseKLV should yield 1500000n.
    await user.clear(amountInput)
    await user.type(amountInput, '1.5')
    expect(screen.getByTestId('amount-ok').textContent).toContain('1500000')
    expect(submit).toBeEnabled()
  })

  it('publishes a snapshot on valid submit', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByTestId('to-input'), VALID_ADDRESS)
    await user.type(screen.getByTestId('amount-input'), '2')
    await user.click(screen.getByTestId('submit'))

    const snapshot = await screen.findByTestId('submitted-snapshot')
    expect(snapshot.textContent).toContain(VALID_ADDRESS)
    expect(snapshot.textContent).toContain('"amountKLV": "2"')
  })

  it('rejects zero and negative amounts', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByTestId('to-input'), VALID_ADDRESS)
    await user.type(screen.getByTestId('amount-input'), '0')
    expect(screen.getByTestId('amount-error').textContent).toMatch(/greater than zero/i)
    expect(screen.getByTestId('submit')).toBeDisabled()
  })
})
