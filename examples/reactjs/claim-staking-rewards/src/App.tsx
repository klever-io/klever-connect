// =============================================================================
// App.tsx — Stage 3 of staking: CLAIM rewards.
// =============================================================================
// `useStaking().claim(claimType, id?)`:
//   - claimType 0 = Staking (APR-based — fixed rate set by asset owner)
//   - claimType 1 = Market
//   - claimType 2 = Allowance
//   - claimType 3 = FPR (dynamic rewards from KDA staking deposits)
//   - id (optional) = asset id to claim rewards for (e.g. "KLV", a KDA id).
// =============================================================================

import { useState } from 'react'
import { useKlever, useStaking } from '@klever/connect-react'

interface ClaimTypeOption {
  value: 0 | 1 | 2 | 3
  label: string
  hint: string
}

const CLAIM_TYPES: ClaimTypeOption[] = [
  { value: 0, label: 'Staking (APR)', hint: 'Fixed APR set by asset owner' },
  { value: 1, label: 'Market', hint: 'Marketplace rewards' },
  { value: 2, label: 'Allowance', hint: 'Allowance-based claims' },
  { value: 3, label: 'FPR', hint: 'Dynamic — based on KDA staking deposits' },
]

export function App(): React.ReactElement {
  const { isConnected, address, connect } = useKlever()
  const { claim, isLoading, error, data, reset } = useStaking()

  const [claimType, setClaimType] = useState<0 | 1 | 2 | 3>(0)
  const [assetId, setAssetId] = useState('KLV')

  const canSubmit = isConnected && !isLoading

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!canSubmit) return
    try {
      await claim(claimType, assetId.length ? assetId : undefined)
    } catch {
      /* surfaced via error */
    }
  }

  if (!isConnected) {
    return (
      <main style={styles.main}>
        <h1 style={styles.h1}>Klever Connect — Claim Rewards</h1>
        <button data-testid="connect-btn" onClick={() => void connect()} style={styles.btn}>
          Connect Wallet
        </button>
      </main>
    )
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Klever Connect — Claim Rewards</h1>
      <p style={styles.lede}>
        Connected as <code>{address}</code>.
      </p>
      <form onSubmit={(e) => void handleSubmit(e)} style={styles.card}>
        <label style={styles.label}>
          Claim type
          <select
            data-testid="claim-type-select"
            value={claimType}
            onChange={(e) => setClaimType(Number(e.target.value) as 0 | 1 | 2 | 3)}
            style={styles.input}
          >
            {CLAIM_TYPES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.value} — {c.label}
              </option>
            ))}
          </select>
        </label>
        <p style={styles.hint}>{CLAIM_TYPES.find((c) => c.value === claimType)?.hint}</p>

        <label style={styles.label}>
          Asset id (optional)
          <input
            data-testid="asset-input"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value.trim())}
            style={styles.input}
            placeholder="KLV"
          />
        </label>
        <button type="submit" data-testid="submit-btn" disabled={!canSubmit} style={styles.btn}>
          {isLoading ? 'Claiming…' : 'Claim'}
        </button>
      </form>

      {data ? (
        <p data-testid="success" style={styles.success}>
          ✓ Claimed! Hash: <code>{(data as { hash: string }).hash}</code>
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
  hint: { color: '#666', fontSize: '0.85rem', marginTop: '0.25rem' },
  btn: { fontSize: '1rem', padding: '0.5rem 1rem', border: '1px solid #333', borderRadius: 6, background: '#fff', cursor: 'pointer', marginTop: '1rem' },
  btnSmall: { fontSize: '0.85rem', padding: '0.3rem 0.7rem', marginTop: '0.5rem', border: '1px solid #999', borderRadius: 4, background: '#fff', cursor: 'pointer' },
  success: { color: '#0a4', marginTop: '0.75rem' },
  err: { color: '#c00', marginTop: '0.5rem' },
}
