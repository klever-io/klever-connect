// react-send-kda-transfer (polished)
//
// Polished KDA transfer. Adds a "holdings picker" that fetches the user's
// account assets via `useKlever().provider.getAccount(address)` and renders
// them as a dropdown.
//
// Per-asset precision: KDA tokens carry their own `precision` field. We use
// `parseUnits(amount, precision)` so the bigint conversion respects the
// token's decimal places.

import { useEffect, useMemo, useState } from 'react'
import {
  useKlever,
  useTransaction,
  isValidAddress,
  parseUnits,
  formatUnits,
} from '@klever/connect'

type Holding = { assetId: string; precision: number; balance: bigint; formatted: string }

export function App() {
  const { isConnected, address, connect, disconnect, extensionInstalled, provider } = useKlever()
  const { sendKDA, isLoading, error, data, reset } = useTransaction()

  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [selected, setSelected] = useState<string>(
    (import.meta.env.VITE_DEFAULT_KDA as string) ?? ''
  )
  const [loadingHoldings, setLoadingHoldings] = useState(false)

  // Fetch holdings whenever the address changes.
  useEffect(() => {
    if (!address) {
      setHoldings([])
      return
    }
    setLoadingHoldings(true)
    void provider
      .getAccount(address)
      .then((acc) => {
        // The shape: acc.assets is a Record<assetId, IAssetBalance>.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const assets = ((acc as any).assets ?? {}) as Record<
          string,
          { balance: number | string; precision: number }
        >
        const list: Holding[] = Object.entries(assets).map(([assetId, info]) => {
          const bal = BigInt(info.balance ?? 0)
          return {
            assetId,
            precision: info.precision ?? 6,
            balance: bal,
            formatted: formatUnits(bal, info.precision ?? 6),
          }
        })
        setHoldings(list)
        if (!selected && list[0]) setSelected(list[0].assetId)
      })
      .catch(() => setHoldings([]))
      .finally(() => setLoadingHoldings(false))
  }, [address, provider, selected])

  const selectedHolding = holdings.find((h) => h.assetId === selected)

  const validation = useMemo(() => {
    if (!to) return 'Recipient required'
    if (!isValidAddress(to)) return 'Invalid recipient address'
    if (!selected) return 'Pick a KDA'
    if (!selectedHolding) return 'Selected KDA not found in holdings'
    try {
      const v = parseUnits(amount, selectedHolding.precision)
      if (v <= 0n) return 'Amount must be > 0'
      if (v > selectedHolding.balance) return 'Amount exceeds balance'
    } catch {
      return 'Invalid amount'
    }
    return null
  }, [to, amount, selected, selectedHolding])

  const handleSend = async () => {
    if (validation || !selectedHolding) return
    await sendKDA({
      to,
      amount: parseUnits(amount, selectedHolding.precision),
      kda: selected,
    })
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 720 }}>
      <h1>Send KDA (with holdings picker)</h1>

      {!extensionInstalled && (
        <p data-testid="no-extension" style={{ color: 'crimson' }}>
          Klever Web Extension not detected.
        </p>
      )}

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

      <fieldset disabled={!isConnected || isLoading}>
        <label>
          KDA:
          <select
            data-testid="kda-select"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {holdings.length === 0 && <option value="">— no holdings —</option>}
            {holdings.map((h) => (
              <option key={h.assetId} value={h.assetId}>
                {h.assetId} — bal {h.formatted}
              </option>
            ))}
          </select>
          {loadingHoldings && (
            <small data-testid="loading-holdings"> (loading holdings…)</small>
          )}
        </label>

        <label>
          Recipient:
          <input data-testid="to" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>

        <label>
          Amount:
          <input
            data-testid="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {selectedHolding && <small> ({selectedHolding.precision} decimals)</small>}
        </label>

        {validation && (
          <p data-testid="validation" style={{ color: 'crimson' }}>
            {validation}
          </p>
        )}

        <button data-testid="send" onClick={() => void handleSend()} disabled={!!validation}>
          {isLoading ? 'Sending…' : 'Send KDA'}
        </button>
      </fieldset>

      {error && (
        <p data-testid="error" role="alert" style={{ color: 'crimson' }}>
          {error.message}
        </p>
      )}
      {data && (
        <p data-testid="success" style={{ color: 'green' }}>
          Sent! Tx: <code>{data.hash}</code>
          <button data-testid="reset" onClick={reset}>
            Send another
          </button>
        </p>
      )}
    </main>
  )
}
