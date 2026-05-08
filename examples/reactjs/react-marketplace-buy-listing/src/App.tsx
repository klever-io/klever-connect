// react-marketplace-buy-listing (polished)
//
// Polished marketplace browse + buy. Companion to the minimal version under
// `marketplace-buy-listing`. Adds:
//   - Listings fetched via provider.call('marketplace/<id>')
//   - Card-based UI per listing
//   - Click-to-buy with toast feedback
//
// The fetch path is illustrative — actual API path may differ per network.

import { useEffect, useMemo, useState } from 'react'
import { useKlever, useTransaction, formatKLV, TXType } from '@klever/connect'

type Listing = {
  orderId: string
  asset: string
  price: bigint
  currency: string
  seller: string
}

type Toast = { kind: 'success' | 'error'; msg: string }

export function App() {
  const { isConnected, address, connect, disconnect, extensionInstalled, provider } = useKlever()
  const { sendTransaction, isLoading, error, data } = useTransaction()

  const marketplaceIdEnv = (import.meta.env.VITE_MARKETPLACE_ID as string) ?? ''
  const [marketplaceId, setMarketplaceId] = useState(marketplaceIdEnv)
  const [listings, setListings] = useState<Listing[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [busyOrder, setBusyOrder] = useState<string | null>(null)

  useEffect(() => {
    if (!marketplaceId) {
      setListings([])
      return
    }
    setLoading(true)
    setFetchError(null)
    void provider
      .call(`marketplace/${marketplaceId}/listings`, undefined)
      .then((res: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = (res as any)?.data?.listings ?? (res as any)?.listings ?? []
        const list: Listing[] = (data as unknown[]).map((raw) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const r = raw as any
          return {
            orderId: String(r.orderId ?? r.id ?? ''),
            asset: String(r.asset ?? r.assetId ?? '?'),
            price: BigInt(r.price ?? 0),
            currency: String(r.currency ?? r.currencyId ?? 'KLV'),
            seller: String(r.seller ?? r.owner ?? '?'),
          }
        })
        setListings(list)
      })
      .catch((e: Error) => setFetchError(e.message))
      .finally(() => setLoading(false))
  }, [marketplaceId, provider])

  // Toast on tx outcomes.
  useEffect(() => {
    if (data) setToast({ kind: 'success', msg: `Bought! Tx: ${data.hash}` })
  }, [data])
  useEffect(() => {
    if (error) setToast({ kind: 'error', msg: error.message })
  }, [error])

  const handleBuy = async (listing: Listing) => {
    setBusyOrder(listing.orderId)
    setToast(null)
    try {
      await sendTransaction({
        contractType: TXType.Buy,
        payload: {
          buyType: 0, // MarketBuy
          id: listing.orderId,
          currencyId: listing.currency,
          amount: listing.price.toString(),
        },
      })
    } finally {
      setBusyOrder(null)
    }
  }

  const empty = useMemo(
    () => !loading && !fetchError && listings.length === 0 && marketplaceId,
    [loading, fetchError, listings, marketplaceId]
  )

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 720 }}>
      <h1>Marketplace: Browse & Buy</h1>

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

      <label>
        Marketplace ID:
        <input
          data-testid="marketplace-id"
          value={marketplaceId}
          onChange={(e) => setMarketplaceId(e.target.value)}
        />
      </label>

      {toast && (
        <div
          data-testid={`toast-${toast.kind}`}
          role="alert"
          style={{
            padding: 12,
            borderRadius: 4,
            background: toast.kind === 'success' ? '#d4f7d4' : '#f7d4d4',
          }}
        >
          {toast.msg}
        </div>
      )}

      {loading && <p data-testid="loading">Loading listings…</p>}
      {fetchError && (
        <p data-testid="fetch-error" style={{ color: 'crimson' }}>
          {fetchError}
        </p>
      )}
      {empty && <p data-testid="empty">No listings on marketplace #{marketplaceId}.</p>}

      <ul data-testid="listings" style={{ listStyle: 'none', padding: 0 }}>
        {listings.map((l) => (
          <li
            key={l.orderId}
            data-testid={`listing-${l.orderId}`}
            style={{
              border: '1px solid #ddd',
              padding: 12,
              borderRadius: 4,
              marginBottom: 8,
            }}
          >
            <div>
              <strong>{l.asset}</strong> — {formatKLV(l.price)} {l.currency}
            </div>
            <small>seller: {l.seller}</small>
            <br />
            <button
              data-testid={`buy-${l.orderId}`}
              onClick={() => void handleBuy(l)}
              disabled={!isConnected || isLoading}
            >
              {busyOrder === l.orderId ? 'Buying…' : `Buy for ${formatKLV(l.price)} ${l.currency}`}
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
