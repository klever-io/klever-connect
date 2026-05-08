// =============================================================================
// App.tsx — Stage 6 of staking: WITHDRAW.
// =============================================================================
// Final stage of the unstaking flow. After unfreeze() and the cooldown has
// elapsed, withdraw() actually returns the assets to the wallet.
//
// `useStaking().withdraw(withdrawType, options?)`:
//   - withdrawType 0 = Unstake (default — completes the freeze cycle).
//   - withdrawType 1 = KDA Pool (FPR-style payout).
//   - options: { kda?, amount?, currencyID? } — only needed for non-default types.
// =============================================================================

import { useState } from 'react'
import { useKlever, useStaking } from '@klever/connect-react'

export function App(): React.ReactElement {
  const { isConnected, address, connect } = useKlever()
  const { withdraw, isLoading, error, data, reset } = useStaking()

  const [withdrawType, setWithdrawType] = useState<0 | 1>(0)
  const [kda, setKda] = useState('KLV')

  const canSubmit = isConnected && !isLoading

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!canSubmit) return
    try {
      await withdraw(withdrawType, kda.length ? { kda } : undefined)
    } catch {
      /* surfaced via error */
    }
  }

  if (!isConnected) {
    return (
      <main style={styles.main}>
        <h1 style={styles.h1}>Klever Connect — Withdraw</h1>
        <button data-testid="connect-btn" onClick={() => void connect()} style={styles.btn}>
          Connect Wallet
        </button>
      </main>
    )
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Klever Connect — Withdraw</h1>
      <p style={styles.lede}>
        Connected as <code>{address}</code>. Withdraw completes the unstaking
        cycle for buckets whose cooldown has elapsed.
      </p>
      <form onSubmit={(e) => void handleSubmit(e)} style={styles.card}>
        <label style={styles.label}>
          Withdraw type
          <select
            data-testid="type-select"
            value={withdrawType}
            onChange={(e) => setWithdrawType(Number(e.target.value) as 0 | 1)}
            style={styles.input}
          >
            <option value={0}>0 — Unstake (default)</option>
            <option value={1}>1 — KDA Pool</option>
          </select>
        </label>
        <label style={styles.label}>
          KDA
          <input data-testid="kda-input" value={kda} onChange={(e) => setKda(e.target.value.trim())} style={styles.input} />
        </label>
        <button type="submit" data-testid="submit-btn" disabled={!canSubmit} style={styles.btn}>
          {isLoading ? 'Withdrawing…' : 'Withdraw'}
        </button>
      </form>

      {data ? (
        <p data-testid="success" style={styles.success}>
          ✓ Withdrawn! Hash: <code>{(data as { hash: string }).hash}</code>
        </p>
      ) : null}
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
