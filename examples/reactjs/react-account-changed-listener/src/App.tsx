// react-account-changed-listener
//
// Demonstrates how a dApp should react when the user switches accounts inside
// the Klever Web Extension WHILE the app is open.
//
// Background:
//   - `BrowserWallet` (which `KleverProvider` instantiates) emits the
//     `'accountChanged'` event whenever the extension reports a new active
//     account. The provider already listens internally to update its own
//     state — but if your app has cached data tied to the old address (a
//     balance, a list of NFTs, anything signed), you must re-fetch it.
//
// Pattern:
//
//   1. Read `wallet` from `useKlever`.
//   2. In a `useEffect`, call `wallet.on('accountChanged', handler)` and
//      return a cleanup that calls `.off`.
//   3. Inside the handler, refresh whatever per-address state you cache.
//
// The example below maintains a tiny "events log" that captures each switch,
// so you can see the timeline visually and the test can assert it.

import { useEffect, useRef, useState } from 'react'
import { useKlever, useBalance } from '@klever/connect'

type LogEntry = { ts: string; oldAddress?: string; newAddress?: string }

export function App() {
  const { wallet, address, isConnected, connect, disconnect, extensionInstalled } = useKlever()
  const { balance, refetch } = useBalance('KLV')

  // Keep an event log so the user (and the test) can verify the listener fires.
  const [log, setLog] = useState<LogEntry[]>([])

  // useRef so the handler closure always sees the latest "old" address without
  // having to re-attach the listener every render.
  const previousAddressRef = useRef<string | undefined>(address)

  useEffect(() => {
    // Update the snapshot every render so the listener can compute the diff.
    previousAddressRef.current = address
  }, [address])

  useEffect(() => {
    if (!wallet) return
    // The handler is invoked by BrowserWallet whenever the extension reports
    // a new account. We log it AND re-trigger any address-bound queries.
    const handler = (next: { address?: string } | string) => {
      const newAddress = typeof next === 'string' ? next : next?.address
      setLog((prev) => [
        { ts: new Date().toISOString(), oldAddress: previousAddressRef.current, newAddress },
        ...prev,
      ])
      // Refetch balance — it was scoped to the old address, so the cached
      // value is stale. `useBalance` already re-runs when `address` changes
      // through context, but calling `.refetch()` makes the dependency
      // explicit and shortens the staleness window.
      void refetch()
    }
    wallet.on('accountChanged', handler)
    return () => {
      wallet.off('accountChanged', handler)
    }
  }, [wallet, refetch])

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 720 }}>
      <h1>Klever Connect: Account-Changed Listener</h1>
      {!extensionInstalled && (
        <p data-testid="no-extension" style={{ color: 'crimson' }}>
          Klever Web Extension not detected — the listener is wired but cannot fire without the
          extension. Install the extension to interact live.
        </p>
      )}

      {isConnected ? (
        <button data-testid="disconnect" onClick={disconnect}>
          Disconnect ({address})
        </button>
      ) : (
        <button data-testid="connect" onClick={() => void connect()}>
          Connect Klever Extension
        </button>
      )}

      <section>
        <h2>Current state</h2>
        <p data-testid="address">Address: {address ?? '(not connected)'}</p>
        <p data-testid="balance">Balance: {balance ? `${balance.formatted} KLV` : '—'}</p>
      </section>

      <section>
        <h2>accountChanged events</h2>
        {log.length === 0 ? (
          <p data-testid="no-events">No switches yet. Change account in the extension to test.</p>
        ) : (
          <ol data-testid="event-log">
            {log.map((e, i) => (
              <li key={i}>
                <code>{e.ts}</code>: <code>{e.oldAddress ?? '?'}</code> →{' '}
                <code>{e.newAddress ?? '?'}</code>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  )
}
