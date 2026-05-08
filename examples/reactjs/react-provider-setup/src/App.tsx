// =============================================================================
// App.tsx — minimal demonstration of useKlever() returning the live state from
// the surrounding <KleverProvider>.
// =============================================================================
// This component renders three pieces of data:
//   1. The currentNetwork the provider was configured with.
//   2. Whether the Klever Web Extension is installed (the provider polls
//      `window.kleverWeb` with backoff on mount; while it is searching, we
//      render a "detecting…" state).
//   3. Whether the wallet is connected. For this example we never call
//      `connect()`, so it should always read "Not connected" — the next
//      example (`react-wallet-connect-disconnect`) wires up a button.
//
// Pedagogical takeaways:
//   - `useKlever()` is the ONE hook you need for app-wide wallet/provider state.
//   - All values are reactive — mounting/unmounting components does not cause
//     extra extension polling because the provider holds the state.
// =============================================================================

import { useKlever } from '@klever/connect-react'

export function App(): React.ReactElement {
  const { currentNetwork, extensionInstalled, searchingExtension, isConnected, address } =
    useKlever()

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Klever Connect — Provider Setup</h1>

      <p style={styles.lede}>
        This is the <code>react-provider-setup</code> example. It demonstrates
        the absolute minimum you need to start building a Klever dApp with
        React: wrap your tree in <code>&lt;KleverProvider&gt;</code> and read
        state via <code>useKlever()</code>.
      </p>

      <section style={styles.card}>
        <h2 style={styles.h2}>Live state</h2>
        <dl style={styles.dl}>
          <dt>Network</dt>
          <dd data-testid="network">{currentNetwork}</dd>

          <dt>Extension</dt>
          <dd data-testid="extension-status">
            {searchingExtension
              ? 'Detecting…'
              : extensionInstalled
                ? 'Installed'
                : 'Not installed — see https://klever.io/extension'}
          </dd>

          <dt>Wallet</dt>
          <dd data-testid="wallet-status">
            {isConnected ? `Connected as ${address}` : 'Not connected'}
          </dd>
        </dl>
      </section>

      <p style={styles.footer}>
        Next: see the <code>react-wallet-connect-disconnect</code> example to
        add a Connect / Disconnect button.
      </p>
    </main>
  )
}

// Inline styles keep this example dependency-free. Real apps should use
// CSS Modules, Tailwind, or whatever stack you prefer.
const styles: Record<string, React.CSSProperties> = {
  main: {
    fontFamily: 'system-ui, sans-serif',
    maxWidth: 720,
    margin: '2rem auto',
    padding: '0 1rem',
    color: '#111',
  },
  h1: { fontSize: '1.5rem', marginBottom: '0.5rem' },
  h2: { fontSize: '1.1rem', margin: '0 0 0.5rem' },
  lede: { color: '#444', lineHeight: 1.5 },
  card: {
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: '1rem 1.25rem',
    marginTop: '1.5rem',
    background: '#fafafa',
  },
  dl: {
    display: 'grid',
    gridTemplateColumns: '8rem 1fr',
    gap: '0.25rem 1rem',
    margin: 0,
  },
  footer: { color: '#666', fontSize: '0.9rem', marginTop: '1.5rem' },
}
