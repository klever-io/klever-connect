// react-error-handling-and-toasts
//
// Pattern: surface KleverError subclasses to the UI via a toast queue.
//
// Background: the SDK throws a hierarchy of typed errors. Each subclass has
// a stable name + code so you can drive different UX per kind:
//
//   - NetworkError       -> "Connection issue, retry?"
//   - ValidationError    -> "Check your inputs"
//   - WalletError        -> "Sign rejected" / "Wallet not connected"
//   - TransactionError   -> "Tx failed: <reason>"
//   - ContractError      -> "Contract reverted: <reason>"
//   - EncodingError      -> developer-facing, log it
//
// We expose a tiny `useToasts()` hook that:
//   - Receives an `unknown` thrown error
//   - Inspects its constructor name (and `code`)
//   - Pushes a toast with the right severity and CTA

import { useState, useCallback, useEffect } from 'react'
import {
  useKlever,
  KleverError,
  ValidationError,
  NetworkError,
  WalletError,
  TransactionError,
  ContractError,
} from '@klever/connect'

type Toast = {
  id: number
  severity: 'info' | 'warn' | 'error' | 'success'
  title: string
  body: string
  cta?: string
}

let _toastSeq = 1

function classify(err: unknown): Omit<Toast, 'id'> {
  // Order matters — check most-specific first.
  if (err instanceof ValidationError) {
    return { severity: 'warn', title: 'Invalid input', body: err.message, cta: 'Check the form' }
  }
  if (err instanceof NetworkError) {
    return {
      severity: 'error',
      title: 'Network problem',
      body: err.message,
      cta: 'Retry in a moment',
    }
  }
  if (err instanceof WalletError) {
    return {
      severity: 'warn',
      title: 'Wallet issue',
      body: err.message,
      cta: 'Check the extension',
    }
  }
  if (err instanceof TransactionError) {
    return { severity: 'error', title: 'Transaction failed', body: err.message }
  }
  if (err instanceof ContractError) {
    return { severity: 'error', title: 'Contract reverted', body: err.message }
  }
  if (err instanceof KleverError) {
    return { severity: 'error', title: 'SDK error', body: `${err.message} (${err.code ?? '?'})` }
  }
  if (err instanceof Error) {
    return { severity: 'error', title: 'Unknown error', body: err.message }
  }
  return { severity: 'error', title: 'Unknown error', body: String(err) }
}

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((err: unknown) => {
    setToasts((prev) => [...prev, { id: _toastSeq++, ...classify(err) }])
  }, [])
  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])
  return { toasts, push, dismiss }
}

export function App() {
  const { isConnected, address, connect, disconnect } = useKlever()
  const { toasts, push, dismiss } = useToasts()

  // Auto-dismiss success toasts after 3s.
  useEffect(() => {
    const timers = toasts
      .filter((t) => t.severity === 'success')
      .map((t) => setTimeout(() => dismiss(t.id), 3000))
    return () => {
      timers.forEach(clearTimeout)
    }
  }, [toasts, dismiss])

  // Buttons trigger fake errors so AI / readers can see each toast variant.
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 720 }}>
      <h1>Error Handling + Toasts</h1>
      <p>
        Each button below throws a different <code>KleverError</code> subclass and shows the
        corresponding toast. Use the <code>classify</code> helper as a reference for your own
        toast queue.
      </p>

      {isConnected ? (
        <p>
          Connected as <code data-testid="address">{address}</code>{' '}
          <button onClick={disconnect}>Disconnect</button>
        </p>
      ) : (
        <button onClick={() => void connect()}>Connect Klever Extension</button>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          data-testid="trigger-validation"
          onClick={() => push(new ValidationError('Address must start with klv1', 'INVALID_ADDR'))}
        >
          ValidationError
        </button>
        <button
          data-testid="trigger-network"
          onClick={() => push(new NetworkError('Failed to fetch /address/...', 'FETCH_FAIL'))}
        >
          NetworkError
        </button>
        <button
          data-testid="trigger-wallet"
          onClick={() => push(new WalletError('User rejected the signature', 'USER_REJECTED'))}
        >
          WalletError
        </button>
        <button
          data-testid="trigger-tx"
          onClick={() => push(new TransactionError('Insufficient KLV for fee', 'INSUFFICIENT'))}
        >
          TransactionError
        </button>
        <button
          data-testid="trigger-contract"
          onClick={() =>
            push(new ContractError('Reverted: not enough deposit', 'CONTRACT_REVERT'))
          }
        >
          ContractError
        </button>
        <button
          data-testid="trigger-unknown"
          onClick={() => push(new Error('Something else went wrong'))}
        >
          Unknown Error
        </button>
      </div>

      <ul data-testid="toasts" style={{ listStyle: 'none', padding: 0, marginTop: 16 }}>
        {toasts.map((t) => (
          <li
            key={t.id}
            data-testid={`toast-${t.id}`}
            data-severity={t.severity}
            style={{
              padding: 12,
              borderRadius: 4,
              marginBottom: 8,
              background:
                t.severity === 'success'
                  ? '#d4f7d4'
                  : t.severity === 'warn'
                  ? '#fff5cc'
                  : t.severity === 'error'
                  ? '#f7d4d4'
                  : '#dcecff',
            }}
          >
            <strong>{t.title}</strong>
            <div>{t.body}</div>
            {t.cta && <small>{t.cta}</small>}
            <button
              data-testid={`dismiss-${t.id}`}
              onClick={() => dismiss(t.id)}
              style={{ marginLeft: 8 }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
