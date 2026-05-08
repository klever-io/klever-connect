// react-tx-monitor-multi
//
// Watch N concurrent transactions with `useTransactionMonitor`. The hook
// exposes:
//   - monitor(hash)        - start watching a single tx
//   - cancel(hash)         - stop watching one
//   - cancelAll()
//   - getStatus(hash)      - read-only lookup
//   - activeMonitors       - array of {hash, status, ...}
//   - isMonitoring         - boolean (any active)
//
// Status updates are emitted as polling completes; the hook handles
// exponential backoff under the hood. The UI here just renders a status
// badge per tx hash.

import { useState } from 'react'
import { useKlever, useTransactionMonitor } from '@klever/connect'

type StatusKind = 'pending' | 'success' | 'failed' | 'unknown'

function statusColor(s: string): string {
  switch (s) {
    case 'success':
      return '#093'
    case 'failed':
      return '#900'
    case 'pending':
      return '#c80'
    default:
      return '#888'
  }
}

export function App() {
  const { isConnected, address, connect, disconnect, provider } = useKlever()
  const { monitor, cancel, cancelAll, activeMonitors, isMonitoring } = useTransactionMonitor({
    provider,
  })

  const [hashInput, setHashInput] = useState('')

  const addMonitor = () => {
    if (!hashInput) return
    monitor(hashInput.trim())
    setHashInput('')
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 720 }}>
      <h1>Multi-Transaction Monitor</h1>
      <p>
        Paste in tx hashes and watch their on-chain status update live. Uses{' '}
        <code>useTransactionMonitor</code> with built-in exponential backoff.
      </p>

      {isConnected ? (
        <p>
          Connected as <code data-testid="address">{address}</code>{' '}
          <button data-testid="disconnect" onClick={disconnect}>
            Disconnect
          </button>
        </p>
      ) : (
        <button data-testid="connect" onClick={() => void connect()}>
          Connect Klever Extension
        </button>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          data-testid="hash-input"
          value={hashInput}
          onChange={(e) => setHashInput(e.target.value)}
          placeholder="0xabc... (paste tx hash)"
          style={{ flex: 1 }}
        />
        <button data-testid="add-monitor" onClick={addMonitor}>
          Watch
        </button>
        <button
          data-testid="cancel-all"
          onClick={cancelAll}
          disabled={!isMonitoring}
        >
          Cancel all
        </button>
      </div>

      <table data-testid="monitor-table" style={{ marginTop: 16, width: '100%' }}>
        <thead>
          <tr>
            <th align="left">Hash</th>
            <th align="left">Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {activeMonitors.length === 0 ? (
            <tr>
              <td colSpan={3} data-testid="no-monitors">
                No active monitors.
              </td>
            </tr>
          ) : (
            activeMonitors.map((m) => {
              const s = (m.status as StatusKind) ?? 'unknown'
              return (
                <tr key={m.hash} data-testid={`row-${m.hash}`}>
                  <td>
                    <code>{m.hash.slice(0, 16)}…</code>
                  </td>
                  <td>
                    <span
                      data-testid={`badge-${m.hash}`}
                      style={{
                        background: statusColor(s),
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    >
                      {s}
                    </span>
                  </td>
                  <td>
                    <button
                      data-testid={`cancel-${m.hash}`}
                      onClick={() => cancel(m.hash)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </main>
  )
}
