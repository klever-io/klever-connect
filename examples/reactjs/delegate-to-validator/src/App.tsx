// =============================================================================
// App.tsx — Stage 2 of staking: DELEGATE bucket to a validator.
// =============================================================================
// Only KLV buckets can be delegated. Each bucket has a fixed amount and a
// single delegation. Bucket must already be frozen (see freeze-for-staking).
//
// `useStaking().delegate(receiver, bucketId?)`:
//   - receiver  : validator's klv1 address.
//   - bucketId  : optional. If omitted, the SDK creates a new bucket atomically.
// =============================================================================

import { useState } from 'react'
import { useKlever, useStaking } from '@klever/connect-react'
import { isKleverAddress } from '@klever/connect'

const DEFAULT_BUCKET = (import.meta.env.VITE_KLV_BUCKET_ID ?? '') as string
const DEFAULT_VALIDATOR = (import.meta.env.VITE_KLV_VALIDATOR ?? '') as string

export function App(): React.ReactElement {
  const { isConnected, address, connect } = useKlever()
  const { delegate, isLoading, error, data, reset } = useStaking()

  const [validator, setValidator] = useState(DEFAULT_VALIDATOR)
  const [bucketId, setBucketId] = useState(DEFAULT_BUCKET)

  const validValidator = isKleverAddress(validator)
  const canSubmit = isConnected && validValidator && !isLoading

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!canSubmit) return
    try {
      await delegate(validator, bucketId.length ? bucketId : undefined)
    } catch {
      /* surfaced via error */
    }
  }

  if (!isConnected) {
    return (
      <main style={styles.main}>
        <h1 style={styles.h1}>Klever Connect — Delegate</h1>
        <button data-testid="connect-btn" onClick={() => void connect()} style={styles.btn}>
          Connect Wallet
        </button>
      </main>
    )
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Klever Connect — Delegate</h1>
      <p style={styles.lede}>
        Connected as <code>{address}</code>. Delegate a frozen KLV bucket to a
        validator to start earning rewards.
      </p>
      <form onSubmit={(e) => void handleSubmit(e)} style={styles.card}>
        <label style={styles.label}>
          Validator (klv1…)
          <input
            data-testid="validator-input"
            value={validator}
            onChange={(e) => setValidator(e.target.value.trim())}
            style={styles.input}
          />
        </label>
        {validator && !validValidator && (
          <p data-testid="validator-error" style={styles.err}>
            Not a valid Klever address.
          </p>
        )}
        <label style={styles.label}>
          Bucket id (optional — leave blank to auto-create)
          <input
            data-testid="bucket-input"
            value={bucketId}
            onChange={(e) => setBucketId(e.target.value.trim())}
            style={styles.input}
            placeholder="0x..."
          />
        </label>
        <button type="submit" data-testid="submit-btn" disabled={!canSubmit} style={styles.btn}>
          {isLoading ? 'Delegating…' : 'Delegate'}
        </button>
      </form>

      {data ? (
        <p data-testid="success" style={styles.success}>
          ✓ Delegated! Hash: <code>{(data as { hash: string }).hash}</code>
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
