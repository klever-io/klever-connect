// =============================================================================
// App.tsx — Send a KDA token (any asset id) using `useTransaction.sendKDA`.
// =============================================================================
// `sendKDA(to, amount, kdaId)` is identical to `sendKLV(to, amount)` except
// for the third argument. The hook builds a `Transfer` contract with `kda`
// set, the SDK protobuf encodes it, the extension signs.
//
// `parseUnits('100', precision)` is used because KDA tokens have arbitrary
// precision (configured at asset creation). Look up your KDA's precision via
// `provider.getAccount(...).assets`.
// =============================================================================

import { useState } from 'react'
import { useKlever, useTransaction } from '@klever/connect-react'
import { isKleverAddress, parseUnits } from '@klever/connect'

const DEFAULT_KDA = (import.meta.env.VITE_KLV_KDA_ID ?? 'KFI') as string

export function App(): React.ReactElement {
  const { isConnected, address, connect } = useKlever()
  const { sendKDA, isLoading, error, data, reset } = useTransaction()

  const [to, setTo] = useState('')
  const [kda, setKda] = useState(DEFAULT_KDA)
  const [amount, setAmount] = useState('1')
  // Precision must match the KDA's on-chain config (commonly 6 for KFI).
  const [precision, setPrecision] = useState('6')

  const validAddr = isKleverAddress(to)
  const validAmount = /^\d+(\.\d+)?$/.test(amount) && Number(amount) > 0
  const validPrecision = /^\d+$/.test(precision) && Number(precision) >= 0
  const validKda = kda.trim().length > 0
  const canSubmit = isConnected && validAddr && validAmount && validPrecision && validKda && !isLoading

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!canSubmit) return
    try {
      await sendKDA(to, parseUnits(amount, Number(precision)), kda)
    } catch {
      /* surfaced via error */
    }
  }

  if (!isConnected) {
    return (
      <main style={styles.main}>
        <h1 style={styles.h1}>Klever Connect — Send KDA</h1>
        <p style={styles.lede}>Connect your wallet to send KDA tokens.</p>
        <button data-testid="connect-btn" onClick={() => void connect()} style={styles.btn}>
          Connect Wallet
        </button>
      </main>
    )
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Klever Connect — Send KDA</h1>
      <p style={styles.lede}>
        Connected as <code>{address}</code>.
      </p>
      <form onSubmit={(e) => void handleSubmit(e)} style={styles.card}>
        <label style={styles.label}>
          KDA asset id
          <input data-testid="kda-input" value={kda} onChange={(e) => setKda(e.target.value.trim())} style={styles.input} />
        </label>
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
          Amount
          <input
            data-testid="amount-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value.trim())}
            inputMode="decimal"
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Precision (decimals)
          <input
            data-testid="precision-input"
            value={precision}
            onChange={(e) => setPrecision(e.target.value.trim())}
            inputMode="numeric"
            style={styles.input}
          />
        </label>
        <button type="submit" data-testid="submit-btn" disabled={!canSubmit} style={styles.btn}>
          {isLoading ? 'Sending…' : `Send ${amount || '0'} ${kda}`}
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
