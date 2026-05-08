// =============================================================================
// App.tsx — Connect / Disconnect UX powered by `useKlever()`.
// =============================================================================
// What it shows:
//   - useKlever().connect()      — initiates the Klever Web Extension flow
//   - useKlever().disconnect()   — clears session + localStorage
//   - useKlever().extensionInstalled — false when the user has no extension
//   - useKlever().searchingExtension — true during the initial detection backoff
//   - useKlever().error           — populated when connect() fails (rejected
//                                    permission, network mismatch, etc.)
// =============================================================================

import { useKlever } from '@klever/connect-react'

const EXTENSION_INSTALL_URL = 'https://klever.io/extension'

export function App(): React.ReactElement {
  const {
    address,
    isConnected,
    isConnecting,
    extensionInstalled,
    searchingExtension,
    connect,
    disconnect,
    error,
  } = useKlever()

  const handleConnect = (): void => {
    // Errors propagate into useKlever().error — we don't need a try/catch here,
    // but we still call .catch() to silence "uncaught" warnings.
    void connect().catch(() => {
      /* surfaced via context */
    })
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.h1}>Klever Connect — Wallet Connect / Disconnect</h1>

      {searchingExtension && (
        <p data-testid="searching" style={styles.info}>
          Detecting Klever Web Extension…
        </p>
      )}

      {!searchingExtension && !extensionInstalled && (
        <div data-testid="no-extension" style={styles.warn}>
          <p>
            <strong>Klever Web Extension not found.</strong>
          </p>
          <p>
            Install it from{' '}
            <a href={EXTENSION_INSTALL_URL} target="_blank" rel="noreferrer">
              {EXTENSION_INSTALL_URL}
            </a>{' '}
            and reload this page.
          </p>
        </div>
      )}

      {!searchingExtension && extensionInstalled && (
        <section style={styles.card}>
          {!isConnected ? (
            <>
              <p style={styles.lede}>
                Press <em>Connect</em> to authorise this site in the Klever Web
                Extension.
              </p>
              <button
                data-testid="connect-btn"
                onClick={handleConnect}
                disabled={isConnecting}
                style={styles.btn}
              >
                {isConnecting ? 'Connecting…' : 'Connect Wallet'}
              </button>
            </>
          ) : (
            <>
              <p style={styles.lede}>
                Connected as <code data-testid="address">{address}</code>
              </p>
              <button data-testid="disconnect-btn" onClick={disconnect} style={styles.btn}>
                Disconnect
              </button>
            </>
          )}

          {error && (
            <p data-testid="error" style={styles.err}>
              {error.message}
            </p>
          )}
        </section>
      )}

      <p style={styles.footer}>
        Tip: closing the extension popup mid-prompt counts as a rejection. Reset
        with the Connect button.
      </p>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    fontFamily: 'system-ui, sans-serif',
    maxWidth: 720,
    margin: '2rem auto',
    padding: '0 1rem',
    color: '#111',
  },
  h1: { fontSize: '1.5rem', marginBottom: '0.5rem' },
  lede: { color: '#444', lineHeight: 1.5 },
  card: {
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: '1rem 1.25rem',
    marginTop: '1rem',
    background: '#fafafa',
  },
  info: { color: '#0a4', background: '#e8fff0', padding: '0.5rem 1rem', borderRadius: 6 },
  warn: { color: '#a40', background: '#fff8e1', padding: '0.75rem 1rem', borderRadius: 6 },
  err: { color: '#c00', marginTop: '0.5rem' },
  btn: {
    fontSize: '1rem',
    padding: '0.5rem 1rem',
    border: '1px solid #333',
    borderRadius: 6,
    background: '#fff',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  footer: { color: '#666', fontSize: '0.9rem', marginTop: '1.5rem' },
}
