// Controlled form that validates a "send KLV" payload IN REAL TIME using the
// SDK's two heaviest validation helpers:
//
//   - `isValidAddress` — bech32 + prefix check.
//   - `parseKLV`        — string -> bigint, throws on malformed input.
//
// The pattern shown here:
//
//   1. Keep raw user input as a string in component state — never coerce to
//      bigint until the user submits.
//   2. Run validators inside `useMemo`/`useEffect`-free derived values so the
//      UI re-renders synchronously with each keystroke.
//   3. Surface error states near each input. Disable the submit button until
//      every field passes.
//
// Anything more elaborate (debouncing, schemas) is intentionally absent — we
// want the SDK helpers to be the focus.

import { useMemo, useState, type FormEvent } from 'react'
import { isValidAddress, parseKLV } from '@klever/connect'

type SubmitPayload = {
  to: string
  amountKLV: string
  // bigint is not JSON-serializable, so we expose the human form for the
  // UI snapshot. Real submission code would pass `parseKLV(amountKLV)`
  // straight into `useTransaction.sendKLV`.
}

type Props = {
  onValidSubmit: (payload: SubmitPayload) => void
}

// Helper: classify a parseKLV attempt without throwing. Returns either the
// parsed bigint or an error message string. The SDK helper itself throws,
// so we catch and convert — typical pattern when wiring SDK helpers into
// React's render loop.
function tryParseKLV(input: string): { ok: true; value: bigint } | { ok: false; error: string } {
  if (input.trim() === '') {
    return { ok: false, error: 'Amount is required' }
  }
  try {
    const value = parseKLV(input)
    if (value <= 0n) {
      return { ok: false, error: 'Amount must be greater than zero' }
    }
    return { ok: true, value }
  } catch (e) {
    // The SDK throws ValidationError with a useful message ("Invalid number").
    return { ok: false, error: e instanceof Error ? e.message : 'Invalid amount' }
  }
}

export function TransferForm({ onValidSubmit }: Props) {
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')

  // Derive validation results on every render. Cheap because parseKLV /
  // isValidAddress are pure synchronous functions.
  const addressState = useMemo(() => {
    if (to === '') return { state: 'empty' as const }
    return isValidAddress(to)
      ? { state: 'valid' as const }
      : { state: 'invalid' as const, error: 'Not a valid klv1... address (bech32 checksum failed)' }
  }, [to])

  const amountState = useMemo(() => tryParseKLV(amount), [amount])

  // Combined enabled flag. We expose it to the test as `data-testid="submit"`'s
  // disabled attribute, so the test asserts both the SDK helpers and the
  // submit-gating wiring.
  const canSubmit = addressState.state === 'valid' && amountState.ok

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    onValidSubmit({ to, amountKLV: amount })
  }

  return (
    <form onSubmit={handleSubmit} data-testid="transfer-form" noValidate>
      <fieldset style={{ marginBottom: 16 }}>
        <label htmlFor="to">Recipient address</label>
        <input
          id="to"
          data-testid="to-input"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="klv1..."
          style={{
            display: 'block',
            width: '100%',
            padding: 8,
            borderColor: addressState.state === 'invalid' ? 'crimson' : 'gray',
          }}
          aria-invalid={addressState.state === 'invalid'}
        />
        {addressState.state === 'invalid' && (
          <small role="alert" data-testid="to-error" style={{ color: 'crimson' }}>
            {addressState.error}
          </small>
        )}
        {addressState.state === 'valid' && (
          <small data-testid="to-ok" style={{ color: 'green' }}>
            ✓ Valid Klever address
          </small>
        )}
      </fieldset>

      <fieldset style={{ marginBottom: 16 }}>
        <label htmlFor="amount">Amount (KLV)</label>
        <input
          id="amount"
          data-testid="amount-input"
          value={amount}
          inputMode="decimal"
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1.5"
          style={{
            display: 'block',
            width: '100%',
            padding: 8,
            borderColor: !amountState.ok && amount !== '' ? 'crimson' : 'gray',
          }}
          aria-invalid={!amountState.ok}
        />
        {!amountState.ok && amount !== '' && (
          <small role="alert" data-testid="amount-error" style={{ color: 'crimson' }}>
            {amountState.error}
          </small>
        )}
        {amountState.ok && (
          <small data-testid="amount-ok" style={{ color: 'green' }}>
            ✓ {amountState.value.toString()} smallest-units
          </small>
        )}
      </fieldset>

      <button data-testid="submit" type="submit" disabled={!canSubmit}>
        {canSubmit ? 'Submit (would call sendKLV)' : 'Fill the form to enable'}
      </button>
    </form>
  )
}
