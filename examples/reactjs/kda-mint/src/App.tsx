// =============================================================================
// App.tsx — KDA mint (admin) — increase a token's circulating supply.
// =============================================================================
// Mint is one of many "asset trigger" actions. The on-chain contract type is
// 11 (AssetTrigger), with a `triggerType` field selecting the action:
//   - triggerType 0 = Mint (this example)
//   - triggerType 1 = Burn (see kda-burn)
//   - triggerType 6 = AddRole (kda-add-role)
//   - …and many more (see SDK README and AssetTriggerRequest types).
//
// To mint you need:
//   - The asset id (e.g. "MTT-ABCD-1A").
//   - The mint role on the connected address (granted by the asset owner).
//   - An `amount` in smallest units (precision-aware).
// =============================================================================

import { useState } from 'react'
import { useKlever, useTransaction } from '@klever/connect-react'
import { TXType, parseUnits } from '@klever/connect'

const DEFAULT_KDA = (import.meta.env.VITE_KLV_KDA_ID ?? '') as string

export function App(): React.ReactElement {
  const { isConnected, address, connect } = useKlever()
  const { sendTransaction, isLoading, error, data, reset } = useTransaction()

  const [kda, setKda] = useState(DEFAULT_KDA)
  const [amount, setAmount] = useState('1000')
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
        // contractType 11 = AssetTrigger
        contractType: TXType.AssetTrigger,
        triggerType: 0, // Mint
        assetId: kda,
        amount: parseUnits(amount, Number(precision)),
        receiver: address!, // mint to ourselves; change if you want a different recipient
      } as never)
    } catch {
      /* surfaced via error */
    }
  }

  if (!isConnected) {
    return (
      <main style={styles.main}>
        <h1 style={styles.h1}>Klever Connect — KDA Mint</h1>
        <button data-testid="connect-btn" onClick={() => void connect()} style={styles.btn}>
          Connect Wallet
        </button>
      </main>
    )
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Klever Connect — KDA Mint</h1>
      <p style={styles.lede}>
        Connected as <code>{address}</code>. Requires the mint role on{' '}
        <code>{kda || 'the target asset'}</code>.
      </p>
      <form onSubmit={(e) => void handleSubmit(e)} style={styles.card}>
        <label style={styles.label}>
          Asset id
          <input data-testid="kda-input" value={kda} onChange={(e) => setKda(e.target.value.trim())} style={styles.input} />
        </label>
        <label style={styles.label}>
          Amount to mint
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
          {isLoading ? 'Minting…' : `Mint ${amount} ${kda}`}
        </button>
      </form>

      {data ? (
        <p data-testid="success" style={styles.success}>
          ✓ Minted! Hash: <code>{(data as { hash: string }).hash}</code>
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
