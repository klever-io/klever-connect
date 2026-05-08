// =============================================================================
// App.tsx — KDA burn (admin) — destroy supply.
// =============================================================================
// Burn is contract type 11 (AssetTrigger) with triggerType=1.
// =============================================================================

import { useState } from 'react'
import { useKlever, useTransaction } from '@klever/connect-react'
import { TXType, parseUnits } from '@klever/connect'

const DEFAULT_KDA = (import.meta.env.VITE_KLV_KDA_ID ?? '') as string

export function App(): React.ReactElement {
  const { isConnected, address, connect } = useKlever()
  const { sendTransaction, isLoading, error, data, reset } = useTransaction()

  const [kda, setKda] = useState(DEFAULT_KDA)
  const [amount, setAmount] = useState('100')
  const [precision, setPrecision] = useState('6')

  const validKda = kda.trim().length > 0
  const validAmount = /^\d+(\.\d+)?$/.test(amount) && Number(amount) > 0
  const validPrecision = /^\d+$/.test(precision) && Number(precision) >= 0
  const canSubmit = isConnected && validKda && validAmount && validPrecision && !isLoading

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!canSubmit) return
    try {
      await sendTransaction({
        contractType: TXType.AssetTrigger,
        triggerType: 1, // Burn
        assetId: kda,
        amount: parseUnits(amount, Number(precision)),
      } as never)
    } catch {
      /* surfaced via error */
    }
  }

  if (!isConnected) {
    return (
      <main style={styles.main}>
        <h1 style={styles.h1}>Klever Connect — KDA Burn</h1>
        <button data-testid="connect-btn" onClick={() => void connect()} style={styles.btn}>
          Connect Wallet
        </button>
      </main>
    )
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Klever Connect — KDA Burn</h1>
      <p style={styles.lede}>
        Connected as <code>{address}</code>. Burn destroys supply — this is
        irreversible.
      </p>
      <form onSubmit={(e) => void handleSubmit(e)} style={styles.card}>
        <label style={styles.label}>
          Asset id
          <input data-testid="kda-input" value={kda} onChange={(e) => setKda(e.target.value.trim())} style={styles.input} />
        </label>
        <label style={styles.label}>
          Amount to burn
          <input
            data-testid="amount-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value.trim())}
            inputMode="decimal"
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Precision
          <input
            data-testid="precision-input"
            value={precision}
            onChange={(e) => setPrecision(e.target.value.trim())}
            inputMode="numeric"
            style={styles.input}
          />
        </label>
        <button type="submit" data-testid="submit-btn" disabled={!canSubmit} style={styles.btn}>
          {isLoading ? 'Burning…' : `Burn ${amount} ${kda}`}
        </button>
      </form>

      {data ? (
        <p data-testid="success" style={styles.success}>
          ✓ Burned. Hash: <code>{(data as { hash: string }).hash}</code>
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
  card: { border: '1px solid #ddd', borderRadius: 8, padding: '1rem 1.25rem', marginTop: '1rem', background: '#fff7f7' },
  label: { display: 'block', marginTop: '0.75rem' },
  input: { display: 'block', width: '100%', padding: '0.4rem 0.6rem', marginTop: '0.25rem', boxSizing: 'border-box', fontFamily: 'monospace' },
  btn: { fontSize: '1rem', padding: '0.5rem 1rem', border: '1px solid #c33', borderRadius: 6, background: '#fff', color: '#900', cursor: 'pointer', marginTop: '1rem' },
  btnSmall: { fontSize: '0.85rem', padding: '0.3rem 0.7rem', marginTop: '0.5rem', border: '1px solid #999', borderRadius: 4, background: '#fff', cursor: 'pointer' },
  success: { color: '#0a4', marginTop: '0.75rem' },
  err: { color: '#c00', marginTop: '0.5rem' },
}
