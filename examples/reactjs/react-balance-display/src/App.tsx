// =============================================================================
// App.tsx — Live balance display using `useBalance()`.
// =============================================================================
// useBalance(token, address?):
//   - Polls every 10 seconds (built-in).
//   - Returns { balance, isLoading, error, refetch }.
//   - `balance` is { token, amount: bigint, precision, formatted }.
//
// This example shows two balances side-by-side:
//   1. KLV (default token, 6 decimals).
//   2. Whatever KDA was supplied via VITE_KLV_KDA_ID (default "KFI").
//
// Plus a "Refresh now" button that calls refetch() so the user doesn't have
// to wait for the 10s poll tick.
// =============================================================================

import { useKlever, useBalance } from '@klever/connect-react'

const KDA_ID = (import.meta.env.VITE_KLV_KDA_ID ?? 'KFI') as string

export function App(): React.ReactElement {
  const { isConnected, address, connect } = useKlever()

  if (!isConnected) {
    return (
      <main style={styles.main}>
        <h1 style={styles.h1}>Klever Connect — Balance Display</h1>
        <p style={styles.lede}>Connect a wallet to see live KLV and {KDA_ID} balances.</p>
        <button data-testid="connect-btn" onClick={() => void connect()} style={styles.btn}>
          Connect Wallet
        </button>
      </main>
    )
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Klever Connect — Balance Display</h1>
      <p style={styles.lede}>
        Connected as <code>{address}</code>. Balances below auto-refresh every
        10 seconds.
      </p>
      <BalanceCard token="KLV" />
      <BalanceCard token={KDA_ID} />
    </main>
  )
}

interface BalanceCardProps {
  token: string
}

function BalanceCard({ token }: BalanceCardProps): React.ReactElement {
  // useBalance defaults to the connected wallet's address. Pass the second
  // argument to read any other address.
  const { balance, isLoading, error, refetch } = useBalance(token)

  return (
    <section style={styles.card} data-testid={`balance-card-${token}`}>
      <h2 style={styles.h2}>{token}</h2>
      {isLoading && !balance && <p>Loading…</p>}
      {error && (
        <p data-testid={`error-${token}`} style={styles.err}>
          Error: {error.message}
        </p>
      )}
      {balance && (
        <>
          <p style={styles.amount}>
            <strong data-testid={`amount-${token}`}>{balance.formatted}</strong>{' '}
            <span style={styles.muted}>{balance.token}</span>
          </p>
          <p style={styles.muted}>
            Raw: {balance.amount.toString()} (precision {balance.precision})
          </p>
        </>
      )}
      <button data-testid={`refresh-${token}`} onClick={refetch} style={styles.btnSmall}>
        {isLoading ? 'Refreshing…' : 'Refresh now'}
      </button>
    </section>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: { fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '2rem auto', padding: '0 1rem' },
  h1: { fontSize: '1.5rem' },
  h2: { fontSize: '1.1rem', margin: '0 0 0.5rem' },
  lede: { color: '#444', lineHeight: 1.5 },
  card: { border: '1px solid #ddd', borderRadius: 8, padding: '1rem 1.25rem', marginTop: '1rem', background: '#fafafa' },
  amount: { fontSize: '1.25rem', margin: '0.25rem 0' },
  muted: { color: '#666', fontSize: '0.9rem' },
  err: { color: '#c00' },
  btn: { fontSize: '1rem', padding: '0.5rem 1rem', border: '1px solid #333', borderRadius: 6, background: '#fff', cursor: 'pointer' },
  btnSmall: { fontSize: '0.85rem', padding: '0.3rem 0.7rem', border: '1px solid #999', borderRadius: 4, background: '#fff', cursor: 'pointer', marginTop: '0.5rem' },
}
