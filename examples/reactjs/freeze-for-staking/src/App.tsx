// =============================================================================
// App.tsx — Stage 1 of staking: FREEZE
// =============================================================================
// Freezing creates a "bucket" of staked assets:
//   - For KLV: the bucket has a 32-byte hash bucketId and a fixed amount.
//     Each user can hold up to 100 KLV buckets.
//   - For other KDAs: there is no bucket — the frozen amount accumulates.
//
// Adding to an existing bucket RESETS the minimum unfreeze time. After
// freezing, the bucket id appears in the receipt:
//   const result = await freeze(amount, 'KLV')
//   const receipt = await result.wait()
//   const bucketId = receipt.receipts?.[0]?.bucketId
//
// =============================================================================

import { useState } from 'react'
import { useKlever, useStaking } from '@klever/connect-react'
import { parseKLV, parseUnits } from '@klever/connect'

export function App(): React.ReactElement {
  const { isConnected, address, connect } = useKlever()
  const { freeze, isLoading, error, data, reset } = useStaking()

  const [kda, setKda] = useState('KLV')
  const [amount, setAmount] = useState('100')
  const [precision, setPrecision] = useState('6')
  const [bucketId, setBucketId] = useState<string | null>(null)

  const validAmount = /^\d+(\.\d+)?$/.test(amount) && Number(amount) > 0
  const canSubmit = isConnected && validAmount && !isLoading

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!canSubmit) return
    setBucketId(null)
    try {
      const parsed = kda === 'KLV' ? parseKLV(amount) : parseUnits(amount, Number(precision))
      const result = await freeze(parsed, kda === 'KLV' ? undefined : kda)

      // Bucket id only exists for KLV freezes; wait for confirmation to read it.
      if (kda === 'KLV') {
        const receipt = (await result.wait()) as unknown as {
          receipts?: Array<{ bucketId?: string }>
        }
        setBucketId(receipt?.receipts?.[0]?.bucketId ?? null)
      }
    } catch {
      /* surfaced via error */
    }
  }

  if (!isConnected) {
    return (
      <main style={styles.main}>
        <h1 style={styles.h1}>Klever Connect — Freeze (stake)</h1>
        <p style={styles.lede}>Connect a wallet to freeze KLV.</p>
        <button data-testid="connect-btn" onClick={() => void connect()} style={styles.btn}>
          Connect Wallet
        </button>
      </main>
    )
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Klever Connect — Freeze (stake)</h1>
      <p style={styles.lede}>
        Connected as <code>{address}</code>. Freezing KLV creates a bucket you
        can later delegate to a validator. Freezing other KDAs accumulates
        a frozen balance.
      </p>
      <form onSubmit={(e) => void handleSubmit(e)} style={styles.card}>
        <label style={styles.label}>
          KDA (use <code>KLV</code> for KLV)
          <input data-testid="kda-input" value={kda} onChange={(e) => setKda(e.target.value.trim())} style={styles.input} />
        </label>
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
        {kda !== 'KLV' && (
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
        )}
        <button type="submit" data-testid="submit-btn" disabled={!canSubmit} style={styles.btn}>
          {isLoading ? 'Freezing…' : `Freeze ${amount || '0'} ${kda}`}
        </button>
      </form>

      {data ? (
        <p data-testid="success" style={styles.success}>
          ✓ Submitted! Hash: <code>{(data as { hash: string }).hash}</code>
          {bucketId && (
            <>
              <br />
              Bucket id: <code data-testid="bucket-id">{bucketId}</code>
            </>
          )}
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
