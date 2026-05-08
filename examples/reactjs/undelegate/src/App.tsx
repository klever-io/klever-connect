// =============================================================================
// App.tsx — Stage 4 of staking: UNDELEGATE.
// =============================================================================
// `useStaking().undelegate(bucketId)` removes the validator delegation but
// keeps the KLV frozen. To actually receive the assets back you must then:
//   - call unfreeze (stage 5),
//   - wait for cooldown,
//   - call withdraw (stage 6).
// =============================================================================

import { useState } from 'react'
import { useKlever, useStaking } from '@klever/connect-react'

const DEFAULT_BUCKET = (import.meta.env.VITE_KLV_BUCKET_ID ?? '') as string

export function App(): React.ReactElement {
  const { isConnected, address, connect } = useKlever()
  const { undelegate, isLoading, error, data, reset } = useStaking()
  const [bucketId, setBucketId] = useState(DEFAULT_BUCKET)

  const validBucket = bucketId.trim().length > 0
  const canSubmit = isConnected && validBucket && !isLoading

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!canSubmit) return
    try {
      await undelegate(bucketId)
    } catch {
      /* surfaced via error */
    }
  }

  if (!isConnected) {
    return (
      <main style={styles.main}>
        <h1 style={styles.h1}>Klever Connect — Undelegate</h1>
        <button data-testid="connect-btn" onClick={() => void connect()} style={styles.btn}>
          Connect Wallet
        </button>
      </main>
    )
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Klever Connect — Undelegate</h1>
      <p style={styles.lede}>
        Connected as <code>{address}</code>. Undelegating leaves the bucket
        frozen — start the cooldown via <code>unfreeze/</code> next.
      </p>
      <form onSubmit={(e) => void handleSubmit(e)} style={styles.card}>
        <label style={styles.label}>
          Bucket id
          <input
            data-testid="bucket-input"
            value={bucketId}
            onChange={(e) => setBucketId(e.target.value.trim())}
            style={styles.input}
            placeholder="0x..."
          />
        </label>
        <button type="submit" data-testid="submit-btn" disabled={!canSubmit} style={styles.btn}>
          {isLoading ? 'Undelegating…' : 'Undelegate'}
        </button>
      </form>

      {data ? (
        <p data-testid="success" style={styles.success}>
          ✓ Undelegated! Hash: <code>{(data as { hash: string }).hash}</code>
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
