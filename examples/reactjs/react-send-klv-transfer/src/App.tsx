// react-send-klv-transfer (polished)
//
// Larger sibling of flow #17's minimal React variant. Adds:
//   - Live validation (isValidAddress + parseKLV)
//   - Loading state (button spinner) while signing
//   - Toast-style success / error banner
//   - Reset button after success

import { useEffect, useMemo, useState } from 'react'
import { useKlever, useTransaction, isValidAddress, parseKLV, formatKLV } from '@klever/connect'

type Toast = { kind: 'success' | 'error'; message: string }

export function App() {
  const { isConnected, address, connect, disconnect, extensionInstalled } = useKlever()
  const { sendKLV, isLoading, error, data, reset } = useTransaction()

  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [toast, setToast] = useState<Toast | null>(null)

  const validation = useMemo(() => {
    if (!to) return { kind: 'empty' as const }
    if (!isValidAddress(to)) return { kind: 'bad-address' as const, msg: 'Invalid klv1 address' }
    if (!amount) return { kind: 'empty-amount' as const }
    try {
      const v = parseKLV(amount)
      if (v <= 0n) return { kind: 'zero' as const, msg: 'Amount must be > 0' }
    } catch (e) {
      return { kind: 'bad-amount' as const, msg: e instanceof Error ? e.message : 'Bad amount' }
    }
    return { kind: 'ok' as const }
  }, [to, amount])

  // Surface SDK errors as toasts without losing form state.
  useEffect(() => {
    if (error) setToast({ kind: 'error', message: error.message })
  }, [error])
  useEffect(() => {
    if (data) setToast({ kind: 'success', message: `Sent! Tx hash: ${data.hash}` })
  }, [data])

  const handleSend = async () => {
    if (validation.kind !== 'ok') return
    setToast(null)
    await sendKLV({ to, amount: parseKLV(amount) })
  }

  const handleReset = () => {
    reset()
    setTo('')
    setAmount('')
    setToast(null)
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 720 }}>
      <h1>Send KLV (polished)</h1>

      {!extensionInstalled && (
        <p data-testid="no-extension" style={{ color: 'crimson' }}>
          Klever Web Extension not detected.
        </p>
      )}

      {isConnected ? (
        <p>
          Connected as <code data-testid="address">{address}</code>{' '}
          <button data-testid="disconnect" onClick={disconnect}>
            Disconnect
          </button>
        </p>
      ) : (
        <button data-testid="connect" onClick={() => void connect()}>
          Connect Klever Extension
        </button>
      )}

      {toast && (
        <div
          data-testid={`toast-${toast.kind}`}
          role="alert"
          style={{
            padding: 12,
            borderRadius: 4,
            background: toast.kind === 'success' ? '#d4f7d4' : '#f7d4d4',
            color: toast.kind === 'success' ? '#093' : '#900',
            margin: '16px 0',
          }}
        >
          {toast.message}
        </div>
      )}

      <fieldset disabled={!isConnected || isLoading}>
        <label>
          Recipient:
          <input
            data-testid="to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="klv1..."
            style={{ width: '100%' }}
          />
        </label>
        {validation.kind === 'bad-address' && (
          <small data-testid="to-error" style={{ color: 'crimson' }}>
            {validation.msg}
          </small>
        )}

        <label>
          Amount (KLV):
          <input
            data-testid="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
          />
        </label>
        {(validation.kind === 'zero' || validation.kind === 'bad-amount') && (
          <small data-testid="amount-error" style={{ color: 'crimson' }}>
            {validation.msg}
          </small>
        )}
        {validation.kind === 'ok' && (
          <small data-testid="preview">
            Will send {formatKLV(parseKLV(amount))} KLV to {to.slice(0, 12)}…
          </small>
        )}

        <div>
          <button
            data-testid="send"
            onClick={() => void handleSend()}
            disabled={validation.kind !== 'ok'}
          >
            {isLoading ? 'Signing…' : 'Send KLV'}
          </button>
          {data && (
            <button data-testid="reset" onClick={handleReset}>
              Send another
            </button>
          )}
        </div>
      </fieldset>
    </main>
  )
}
