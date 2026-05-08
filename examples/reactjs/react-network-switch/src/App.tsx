// =============================================================================
// App.tsx — Switch network without disconnecting the wallet.
// =============================================================================
// `useKlever().switchNetwork(name)` updates:
//   - the underlying KleverProvider HTTP endpoint,
//   - the BrowserWallet's network handle (so signed txs target the new chain),
//   - localStorage (so a reload remembers the selection).
//
// The example renders:
//   - A badge showing the current network.
//   - A <select> with all four built-in networks.
//   - The latest known block number for sanity.
// =============================================================================

import { useEffect, useState } from 'react'
import { useKlever } from '@klever/connect-react'
import type { NetworkName } from '@klever/connect'

const NETWORK_OPTIONS: NetworkName[] = ['mainnet', 'testnet', 'devnet', 'local']

export function App(): React.ReactElement {
  const { currentNetwork, switchNetwork, provider, error } = useKlever()
  const [pending, setPending] = useState(false)
  const [block, setBlock] = useState<number | null>(null)
  const [readErr, setReadErr] = useState<Error | null>(null)

  // Whenever the network changes, refetch the latest block so the user sees
  // the switch took effect at the RPC layer.
  useEffect(() => {
    let cancelled = false
    setBlock(null)
    setReadErr(null)
    provider
      .getBlockNumber()
      .then((n) => {
        if (!cancelled) setBlock(n)
      })
      .catch((err) => {
        if (!cancelled) setReadErr(err as Error)
      })
    return () => {
      cancelled = true
    }
  }, [currentNetwork, provider])

  const handleChange = async (next: NetworkName): Promise<void> => {
    setPending(true)
    try {
      await switchNetwork(next)
    } catch {
      // surfaced via useKlever().error
    } finally {
      setPending(false)
    }
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Klever Connect — Network Switch</h1>

      <p style={styles.lede}>
        Switching networks does not disconnect the wallet. The BrowserWallet
        keeps the same address but signs against the new chain. The HTTP
        provider, network selection in localStorage, and any subsequent reads
        all flip atomically.
      </p>

      <section style={styles.card}>
        <p>
          Current network:{' '}
          <strong data-testid="current-network" style={styles.badge}>
            {currentNetwork}
          </strong>
        </p>

        <label style={styles.label}>
          Switch to:{' '}
          <select
            data-testid="network-select"
            value={currentNetwork}
            disabled={pending}
            onChange={(e) => void handleChange(e.target.value as NetworkName)}
          >
            {NETWORK_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <p data-testid="block-readout" style={styles.muted}>
          {block === null && !readErr && 'Fetching latest block…'}
          {block !== null && `Latest block on ${currentNetwork}: ${block}`}
          {readErr && `RPC error: ${readErr.message}`}
        </p>

        {error && <p style={styles.err}>switchNetwork() failed: {error.message}</p>}
      </section>

      <p style={styles.footer}>
        Tip: a fresh dev environment without a local node will fail to reach
        <code> network: 'local'</code>. Switch back to <code>testnet</code> to
        recover.
      </p>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: { fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '2rem auto', padding: '0 1rem' },
  h1: { fontSize: '1.5rem' },
  lede: { color: '#444', lineHeight: 1.5 },
  card: { border: '1px solid #ddd', borderRadius: 8, padding: '1rem 1.25rem', marginTop: '1rem', background: '#fafafa' },
  badge: { padding: '0.1rem 0.4rem', borderRadius: 4, background: '#eef', color: '#024' },
  label: { display: 'block', marginTop: '0.75rem' },
  muted: { color: '#666', marginTop: '0.75rem' },
  err: { color: '#c00', marginTop: '0.5rem' },
  footer: { color: '#666', fontSize: '0.9rem', marginTop: '1.5rem' },
}
