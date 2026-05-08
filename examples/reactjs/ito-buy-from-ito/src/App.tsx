// ito-buy-from-ito (React)
//
// Buy a pack from an Initial Token Offering (ITO) using the Buy contract
// with `buyType=1` (ITOBuy variant).
//
// Background:
//   - An ITO is configured with named "packs" — each pack has a price (in a
//     specific currency) and an amount of the destination KDA.
//   - To buy: contractType=17 (Buy), buyType=1 (ITO), id=<KDA being sold>,
//     currencyId=<what you're paying with>, amount=<currency amount>.
//
// We don't fetch pack metadata in this example (provider.call to /ito/{kda}
// would be the path, but the API surface is wide). Instead the user types
// the KDA, the pack id (informational), and the amount they're spending.

import { useMemo, useState } from 'react'
import { useKlever, useTransaction, parseKLV, TXType } from '@klever/connect'

export function App() {
  const { isConnected, address, connect, disconnect, extensionInstalled } = useKlever()
  const { sendTransaction, isLoading, error, data } = useTransaction()

  const [itoKda, setItoKda] = useState((import.meta.env.VITE_ITO_KDA as string) ?? '')
  const [packId, setPackId] = useState((import.meta.env.VITE_ITO_PACK_ID as string) ?? '1')
  const [spendKLV, setSpendKLV] = useState('1')
  const [currencyId] = useState('KLV')

  const validation = useMemo(() => {
    if (!itoKda) return 'KDA required (the asset the ITO is selling)'
    if (!packId) return 'Pack id required'
    try {
      if (parseKLV(spendKLV) <= 0n) return 'Spend amount must be > 0'
    } catch {
      return 'Invalid amount'
    }
    return null
  }, [itoKda, packId, spendKLV])

  const handleBuy = async () => {
    if (validation || !isConnected) return
    await sendTransaction({
      contractType: TXType.Buy,
      payload: {
        buyType: 1, // ITOBuy
        id: itoKda, // the KDA being sold
        currencyId, // what we're paying with
        amount: parseKLV(spendKLV).toString(),
      },
    })
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 720 }}>
      <h1>ITO: Buy from an Initial Token Offering</h1>

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
          ITO KDA:
          <input
            data-testid="kda"
            value={itoKda}
            onChange={(e) => setItoKda(e.target.value)}
            placeholder="MYTOKEN-A1B2"
          />
        </label>
        <label>
          Pack ID:
          <input data-testid="pack-id" value={packId} onChange={(e) => setPackId(e.target.value)} />
        </label>
        <label>
          Spend (KLV):
          <input
            data-testid="spend"
            value={spendKLV}
            onChange={(e) => setSpendKLV(e.target.value)}
          />
        </label>
        {validation && (
          <p data-testid="validation" style={{ color: 'crimson' }}>
            {validation}
          </p>
        )}
        <button data-testid="buy" onClick={() => void handleBuy()} disabled={!!validation}>
          {isLoading ? 'Buying…' : 'Buy from ITO'}
        </button>
      </fieldset>

      {error && (
        <p data-testid="error" role="alert" style={{ color: 'crimson' }}>
          {error.message}
        </p>
      )}
      {data && (
        <p data-testid="success" style={{ color: 'green' }}>
          Bought! Tx: <code>{data.hash}</code>
        </p>
      )}
    </main>
  )
}
