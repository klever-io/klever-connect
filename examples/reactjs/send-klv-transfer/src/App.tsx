// =============================================================================
// App.tsx — Send 1 KLV (or any amount) using `useTransaction.sendKLV`.
// =============================================================================
// `useTransaction()` returns:
//   - sendKLV(to, amount)     — Transfer KLV to an address
//   - sendKDA(to, amount, kda)— Transfer a KDA token (see send-kda-transfer)
//   - sendTransaction(c)       — Any contract type
//   - isLoading, error, data, reset
//
// `parseKLV('1')` converts "1" KLV to 1_000_000n (6 decimals). Always send
// amounts in smallest units — never the human-readable string.
// =============================================================================

import { useState } from 'react'
import { useKlever, useTransaction } from '@klever/connect-react'
import { parseKLV, isKleverAddress } from '@klever/connect'

export function App(): React.ReactElement {
  const { isConnected, address, connect } = useKlever()
  const { sendKLV, isLoading, error, data, reset } = useTransaction()
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('1')

  const validAddr = isKleverAddress(to)
  const validAmount = /^\d+(\.\d+)?$/.test(amount) && Number(amount) > 0
  const canSubmit = isConnected && validAddr && validAmount && !isLoading

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!canSubmit) return
    try {
      await sendKLV(to, parseKLV(amount))
    } catch {
      // surfaced via useTransaction().error
    }
  }

  if (!isConnected) {
    return (
      <main style={styles.main}>
        <h1 style={styles.h1}>Klever Connect — Send KLV</h1>
        <p style={styles.lede}>Connect your wallet to send KLV.</p>
        <button data-testid="connect-btn" onClick={() => void connect()} style={styles.btn}>
          Connect Wallet
        </button>
      </main>
    )
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Klever Connect — Send KLV</h1>
      <p style={styles.lede}>
        Connected as <code>{address}</code>.
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} style={styles.card}>
        <label style={styles.label}>
          Recipient (klv1…)
          <input
            data-testid="to-input"
            value={to}
            onChange={(e) => setTo(e.target.value.trim())}
            placeholder="klv1..."
            style={styles.input}
          />
        </label>
        {to && !validAddr && (
          <p data-testid="to-error" style={styles.err}>
            Not a valid Klever address.
          </p>
        )}

        <label style={styles.label}>
          Amount (KLV)
          <input
            data-testid="amount-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value.trim())}
            inputMode="decimal"
            style={styles.input}
          />
        </label>

        <button
          type="submit"
          data-testid="submit-btn"
          disabled={!canSubmit}
          style={styles.btn}
        >
          {isLoading ? 'Sending…' : `Send ${amount || '0'} KLV`}
        </button>
      </form>

      {data && (
        <p data-testid="success" style={styles.success}>
          ✓ Submitted! Hash: <code>{data.hash}</code>
        </p>
      )}
      {error && (
        <p data-testid="error" style={styles.err}>
          ✗ {error.message}
        </p>
      )}
      {(data || error) && (
        <button onClick={reset} style={styles.btnSmall}>
          Reset
        </button>
      )}
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: { fontFamily: 'system-ui, sans-serif', maxWidth: 640, margin: '2rem auto', padding: '0 1rem' },
  h1: { fontSize: '1.5rem' },
  lede: { color: '#444', lineHeight: 1.5 },
  card: { border: '1px solid #ddd', borderRadius: 8, padding: '1rem 1.25rem', marginTop: '1rem', background: '#fafafa' },
  label: { display: 'block', marginTop: '0.75rem' },
  input: { display: 'block', width: '100%', padding: '0.4rem 0.6rem', marginTop: '0.25rem', boxSizing: 'border-box', fontFamily: 'monospace' },
  btn: { fontSize: '1rem', padding: '0.5rem 1rem', border: '1px solid #333', borderRadius: 6, background: '#fff', cursor: 'pointer', marginTop: '1rem' },
  btnSmall: { fontSize: '0.85rem', padding: '0.3rem 0.7rem', marginTop: '0.5rem', border: '1px solid #999', borderRadius: 4, background: '#fff', cursor: 'pointer' },
  success: { color: '#0a4', marginTop: '0.75rem' },
  err: { color: '#c00', marginTop: '0.5rem' },
}
