// marketplace-buy-listing (React, minimal)
//
// Buy a marketplace listing using the `Buy` contract (TXType.Buy = 17).
// `react-marketplace-buy-listing` is the polished version with browse UI;
// this folder is the minimal "I have an order id, just buy it" form.
//
// Buy contract payload shape (from connect-provider's BuyRequest):
//   { buyType, id, currencyId, amount }
// where buyType=0 = MarketBuy, buyType=1 = ITOBuy. We use 0 here.

import { useMemo, useState } from 'react'
import { useKlever, useTransaction, parseKLV, TXType } from '@klever/connect'

export function App() {
  const { isConnected, address, connect, disconnect, extensionInstalled } = useKlever()
  const { sendTransaction, isLoading, error, data } = useTransaction()

  const [orderId, setOrderId] = useState((import.meta.env.VITE_ORDER_ID as string) ?? '')
  const [priceKLV, setPriceKLV] = useState('1')
  const [currencyId] = useState('KLV')

  const validation = useMemo(() => {
    if (!orderId.trim()) return 'Order id required'
    try {
      if (parseKLV(priceKLV) <= 0n) return 'Price must be > 0'
    } catch {
      return 'Invalid price'
    }
    return null
  }, [orderId, priceKLV])

  const handleBuy = async () => {
    if (validation || !isConnected) return
    await sendTransaction({
      contractType: TXType.Buy,
      payload: {
        buyType: 0, // MarketBuy
        id: orderId,
        currencyId,
        amount: parseKLV(priceKLV).toString(),
      },
    })
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 720 }}>
      <h1>Marketplace: Buy Listing (minimal)</h1>
      <p>Type the marketplace order id and confirm purchase.</p>

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
          Order ID:
          <input
            data-testid="order-id"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
        </label>
        <label>
          Price (KLV):
          <input
            data-testid="price"
            value={priceKLV}
            onChange={(e) => setPriceKLV(e.target.value)}
          />
        </label>
        {validation && (
          <p data-testid="validation" style={{ color: 'crimson' }}>
            {validation}
          </p>
        )}
        <button data-testid="buy" onClick={() => void handleBuy()} disabled={!!validation}>
          {isLoading ? 'Confirming…' : 'Buy listing'}
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
