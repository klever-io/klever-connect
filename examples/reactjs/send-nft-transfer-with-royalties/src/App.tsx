// =============================================================================
// App.tsx — Transfer a single NFT, paying royalties to the asset issuer.
// =============================================================================
// On Klever an NFT is a KDA whose precision is 0 and id format is "ASSET/123",
// where 123 is the per-asset NFT index.
//
// `useTransaction.sendTransaction({ contractType: TXType.Transfer, kda, ... })`
// supports two royalty-bearing fields when sending an NFT:
//   - `kdaRoyalties`  : amount of the KDA itself paid to the issuer
//   - `klvRoyalties`  : amount of KLV paid to the issuer
//
// Both are in smallest units. The extension popup shows the user the
// breakdown before signing.
// =============================================================================

import { useState } from 'react'
import { useKlever, useTransaction } from '@klever/connect-react'
import { isKleverAddress, parseKLV, TXType } from '@klever/connect'

const DEFAULT_NFT = (import.meta.env.VITE_KLV_NFT_ID ?? '') as string

export function App(): React.ReactElement {
  const { isConnected, address, connect } = useKlever()
  const { sendTransaction, isLoading, error, data, reset } = useTransaction()

  const [to, setTo] = useState('')
  const [nftId, setNftId] = useState(DEFAULT_NFT) // e.g. "MYNFT-A1B2/1"
  const [klvRoyaltyHuman, setKlvRoyaltyHuman] = useState('0')
  const [kdaRoyalty, setKdaRoyalty] = useState('0') // in smallest units

  const validAddr = isKleverAddress(to)
  const validNft = /^[A-Z0-9-]+\/\d+$/.test(nftId)
  const validKlvR = /^\d+(\.\d+)?$/.test(klvRoyaltyHuman)
  const validKdaR = /^\d+$/.test(kdaRoyalty)
  const canSubmit = isConnected && validAddr && validNft && validKlvR && validKdaR && !isLoading

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!canSubmit) return
    try {
      // For NFTs, `amount` is always 1 (single NFT transfer). KLV royalty
      // converts via parseKLV; KDA royalty is in smallest units already.
      await sendTransaction({
        contractType: TXType.Transfer,
        receiver: to,
        amount: 1,
        kda: nftId,
        klvRoyalties: parseKLV(klvRoyaltyHuman),
        kdaRoyalties: BigInt(kdaRoyalty),
      } as never)
    } catch {
      /* surfaced via error */
    }
  }

  if (!isConnected) {
    return (
      <main style={styles.main}>
        <h1 style={styles.h1}>Klever Connect — Send NFT</h1>
        <p style={styles.lede}>Connect a wallet to transfer an NFT.</p>
        <button data-testid="connect-btn" onClick={() => void connect()} style={styles.btn}>
          Connect Wallet
        </button>
      </main>
    )
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Klever Connect — Send NFT (with royalties)</h1>
      <p style={styles.lede}>
        Connected as <code>{address}</code>.
      </p>
      <form onSubmit={(e) => void handleSubmit(e)} style={styles.card}>
        <label style={styles.label}>
          NFT id (e.g. <code>MYNFT-A1B2/1</code>)
          <input data-testid="nft-input" value={nftId} onChange={(e) => setNftId(e.target.value.trim())} style={styles.input} />
        </label>
        {nftId && !validNft && (
          <p data-testid="nft-error" style={styles.err}>
            Expected format: COLLECTION-XXXX/INDEX
          </p>
        )}
        <label style={styles.label}>
          Recipient
          <input data-testid="to-input" value={to} onChange={(e) => setTo(e.target.value.trim())} style={styles.input} />
        </label>
        <label style={styles.label}>
          KLV royalty (paid to issuer)
          <input
            data-testid="klv-royalty-input"
            value={klvRoyaltyHuman}
            onChange={(e) => setKlvRoyaltyHuman(e.target.value.trim())}
            inputMode="decimal"
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          KDA royalty (smallest units)
          <input
            data-testid="kda-royalty-input"
            value={kdaRoyalty}
            onChange={(e) => setKdaRoyalty(e.target.value.trim())}
            inputMode="numeric"
            style={styles.input}
          />
        </label>
        <button type="submit" data-testid="submit-btn" disabled={!canSubmit} style={styles.btn}>
          {isLoading ? 'Sending…' : 'Transfer NFT'}
        </button>
      </form>

      {data && (
        <p data-testid="success" style={styles.success}>
          ✓ Sent! Hash: <code>{data.hash}</code>
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
